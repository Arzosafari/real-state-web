import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { PropertyCard } from '@/components/cards'
import { IconGrid, IconList, IconSearch } from '@/components/icons'
import { EmptyState, ErrorNote, Pagination, Spinner, cx } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useAuth } from '@/context/AuthContext'
import { useApi, useDebounced } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ApiError, api } from '@/lib/api'
import { humanStatus } from '@/lib/format'
import type { Page, Property, PropertyFacets } from '@/lib/types'

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area_desc', label: 'Largest area' },
]

const PROPERTY_TYPES = [
  'apartment',
  'condominium',
  'house',
  'townhouse',
  'penthouse',
  'office',
  'retail',
  'land',
]

interface Filters {
  q: string
  transaction_type: string
  property_type: string
  location: string
  listing_status: string
  min_price: string
  max_price: string
  bedrooms: string
  sort: string
}

const EMPTY: Filters = {
  q: '',
  transaction_type: '',
  property_type: '',
  location: '',
  listing_status: '',
  min_price: '',
  max_price: '',
  bedrooms: '',
  sort: 'newest',
}

export function PropertiesPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const query = useDebounced(filters.q, 350)
  const facets = useApi<PropertyFacets>('/properties/facets')
  const saved = useApi<{ properties: Property[] } | null>(user ? '/me/saved' : null)

  const params = useMemo(
    () => ({
      q: query || undefined,
      transaction_type: filters.transaction_type || undefined,
      property_type: filters.property_type || undefined,
      location: filters.location || undefined,
      listing_status: filters.listing_status || undefined,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
      bedrooms: filters.bedrooms || undefined,
      sort: filters.sort,
      page,
      page_size: 9,
    }),
    [query, filters, page],
  )

  const { data, loading, error, reload } = useApi<Page<Property>>('/properties', params)

  usePageMeta({
    title: 'Properties',
    description:
      'Search UrbanLedge listings by location, type, price and number of bedrooms, then enquire or save a shortlist.',
  })

  useEffect(() => {
    setPage(1)
  }, [query, filters.transaction_type, filters.property_type, filters.location, filters.listing_status, filters.min_price, filters.max_price, filters.bedrooms, filters.sort])

  const savedIds = useMemo(
    () => new Set((saved.data?.properties ?? []).map((item) => item.id)),
    [saved.data],
  )

  const toggleSaved = useCallback(
    async (property: Property) => {
      if (!user) return
      setNotice(null)
      try {
        if (savedIds.has(property.id)) {
          await api.del(`/me/saved/properties/${property.id}`)
          setNotice(`Removed ${property.title} from your shortlist.`)
        } else {
          await api.post(`/me/saved/properties/${property.id}`)
          setNotice(`Saved ${property.title} to your shortlist.`)
        }
        saved.reload()
      } catch (err) {
        setNotice(err instanceof ApiError ? err.message : 'Your shortlist could not be updated.')
      }
    },
    [saved, savedIds, user],
  )

  function update<K extends keyof Filters>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'sort' && value !== '',
  ).length

  const locationOptions = facets.data?.locations ?? []

  return (
    <>
      <PageHero
        eyebrow="Properties"
        title={
          <>
            Places Ready
            <br />
            To Move Into.
          </>
        }
        copy="Homes, offices and retail space from our completed and in-development projects. Every listing is illustrative demonstration content."
        compact
      />

      <section className="bg-soft pb-20 pt-10 lg:pb-28">
        <div className="shell">
          <div className="border border-hairline bg-white p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
              <label className="relative block">
                <span className="sr-only">Search properties</span>
                <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray" />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(event) => update('q', event.target.value)}
                  placeholder="Search by title, location or reference"
                  className="field-control pl-11"
                />
              </label>
              <div className="flex gap-2" role="group" aria-label="Result layout">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  className={cx(
                    'flex h-[46px] w-[46px] items-center justify-center border',
                    view === 'grid' ? 'border-gold bg-gold text-white' : 'border-hairline text-ink',
                  )}
                  aria-label="Grid view"
                >
                  <IconGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  className={cx(
                    'flex h-[46px] w-[46px] items-center justify-center border',
                    view === 'list' ? 'border-gold bg-gold text-white' : 'border-hairline text-ink',
                  )}
                  aria-label="List view"
                >
                  <IconList className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                aria-expanded={filtersOpen}
                aria-controls="property-filters"
                className="btn-outline-dark"
              >
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>

            {filtersOpen && (
              <div id="property-filters" className="mt-6 grid gap-5 border-t border-hairline pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="field-label">Buy or rent</span>
                  <select
                    className="field-control"
                    value={filters.transaction_type}
                    onChange={(event) => update('transaction_type', event.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="buy">For sale</option>
                    <option value="rent">To rent</option>
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Property type</span>
                  <select
                    className="field-control"
                    value={filters.property_type}
                    onChange={(event) => update('property_type', event.target.value)}
                  >
                    <option value="">Any</option>
                    {(facets.data?.types.length ? facets.data.types : PROPERTY_TYPES).map((item) => (
                      <option key={item} value={item}>
                        {humanStatus(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Location</span>
                  <select
                    className="field-control"
                    value={filters.location}
                    onChange={(event) => update('location', event.target.value)}
                  >
                    <option value="">Any</option>
                    {locationOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Status</span>
                  <select
                    className="field-control"
                    value={filters.listing_status}
                    onChange={(event) => update('listing_status', event.target.value)}
                  >
                    <option value="">Any</option>
                    {(facets.data?.statuses ?? []).map((item) => (
                      <option key={item} value={item}>
                        {humanStatus(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Min price ({facets.data?.min_price ? 'USD' : 'amount'})</span>
                  <input
                    type="number"
                    min={0}
                    className="field-control"
                    value={filters.min_price}
                    onChange={(event) => update('min_price', event.target.value)}
                    placeholder={facets.data?.min_price ? String(Math.floor(facets.data.min_price)) : '0'}
                  />
                </label>
                <label className="block">
                  <span className="field-label">Max price</span>
                  <input
                    type="number"
                    min={0}
                    className="field-control"
                    value={filters.max_price}
                    onChange={(event) => update('max_price', event.target.value)}
                    placeholder={facets.data?.max_price ? String(Math.ceil(facets.data.max_price)) : 'Any'}
                  />
                </label>
                <label className="block">
                  <span className="field-label">Minimum bedrooms</span>
                  <select
                    className="field-control"
                    value={filters.bedrooms}
                    onChange={(event) => update('bedrooms', event.target.value)}
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((count) => (
                      <option key={count} value={count}>
                        {count}+
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Sort by</span>
                  <select
                    className="field-control"
                    value={filters.sort}
                    onChange={(event) => update('sort', event.target.value)}
                  >
                    {SORTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2 lg:col-span-4">
                  <button type="button" className="link-arrow text-gold-deep hover:text-ink" onClick={() => setFilters(EMPTY)}>
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {notice && (
            <p className="mt-4 border border-gold/50 bg-white px-4 py-3 text-sm text-ink/80" role="status">
              {notice}
            </p>
          )}
          {!user && (
            <p className="mt-4 text-sm text-ink/65">
              <Link to="/login" className="text-gold-deep underline">
                Sign in
              </Link>{' '}
              to keep a shortlist of listings.
            </p>
          )}

          <div className="mt-10">
            {loading && <Spinner label="Loading properties" />}
            {error && <ErrorNote message={error} onRetry={reload} />}
            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title="No listings match those filters"
                copy="Try widening the price range or clearing the location."
                action={
                  <button type="button" className="btn-outline-dark" onClick={() => setFilters(EMPTY)}>
                    Clear filters
                  </button>
                }
              />
            )}
            {data && data.items.length > 0 && (
              <div className={cx('grid gap-8', view === 'grid' && 'sm:grid-cols-2 lg:grid-cols-3')}>
                {data.items.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    view={view}
                    canSave={Boolean(user)}
                    saved={savedIds.has(property.id)}
                    onSave={toggleSaved}
                  />
                ))}
              </div>
            )}
          </div>

          {data && data.items.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
