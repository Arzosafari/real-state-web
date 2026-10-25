import { useEffect, useMemo, useState } from 'react'

import { ProjectCard } from '@/components/cards'
import { IconSearch } from '@/components/icons'
import { EmptyState, ErrorNote, Pagination, Spinner, cx } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi, useDebounced } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { Page, Project } from '@/lib/types'

interface ProjectFacets {
  categories: string[]
  locations: string[]
  statuses: string[]
}

export function ProjectsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const debounced = useDebounced(query, 350)
  const facets = useApi<ProjectFacets>('/projects/facets')

  const params = useMemo(
    () => ({
      q: debounced || undefined,
      category: category || undefined,
      location: location || undefined,
      status: status || undefined,
      page,
      page_size: 9,
    }),
    [debounced, category, location, status, page],
  )

  const { data, loading, error, reload } = useApi<Page<Project>>('/projects', params)

  usePageMeta({
    title: 'Projects',
    description:
      'Residential, mixed-use, hospitality and masterplan projects by UrbanLedge, complete and in development.',
  })

  useEffect(() => {
    setPage(1)
  }, [debounced, category, location, status])

  const active = Boolean(debounced || category || location || status)

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={
          <>
            Projects Across
            <br />
            Cities and Regions.
          </>
        }
        copy="A portfolio spanning residences, workplaces, hospitality and urban quarters — each one documented with its design intent."
        compact
      />

      <section className="bg-soft pb-20 pt-10 lg:pb-28">
        <div className="shell">
          <div className="grid gap-4 border border-hairline bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search projects</span>
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects"
                className="field-control pl-11"
              />
            </label>
            <label className="block">
              <span className="field-label">Category</span>
              <select
                className="field-control"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {(facets.data?.categories ?? []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Location</span>
              <select
                className="field-control"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              >
                <option value="">All locations</option>
                {(facets.data?.locations ?? []).map((item) => (
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
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Any status</option>
                {(facets.data?.statuses ?? []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            {active && (
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  className="link-arrow text-gold-deep hover:text-ink"
                  onClick={() => {
                    setQuery('')
                    setCategory('')
                    setLocation('')
                    setStatus('')
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className={cx('mt-10', loading && 'min-h-[8rem]')}>
            {loading && <Spinner label="Loading projects" />}
            {error && <ErrorNote message={error} onRetry={reload} />}
            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title="No projects match those filters"
                copy="Try a different category or clear the search."
              />
            )}
            {data && data.items.length > 0 && (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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
