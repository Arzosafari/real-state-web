import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PropertyCard } from '@/components/cards'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { IconArrow, IconHeart } from '@/components/icons'
import { DemoTag, EmptyState, ErrorNote, Img, Spinner } from '@/components/ui/Primitives'
import { Lightbox, type LightboxImage } from '@/components/ui/Lightbox'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ApiError, api } from '@/lib/api'
import { formatArea, formatPrice, humanStatus } from '@/lib/format'
import type { Page, Property } from '@/lib/types'

export function PropertyDetailPage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { settings } = useSite()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const { data: property, loading, error, reload } = useApi<Property>(`/properties/${slug}`)
  const related = useApi<Page<Property>>(
    property ? '/properties' : null,
    { location: property?.location, page_size: 4 },
    [property?.location],
  )
  const shortlist = useApi<{ properties: Property[] } | null>(user ? '/me/saved' : null)

  usePageMeta({
    title: property?.seo_title ?? property?.title ?? 'Property',
    description: property?.seo_description ?? property?.excerpt,
    image: property?.images?.[0] ?? null,
  })

  useEffect(() => {
    if (!property || !shortlist.data) return
    setSaved(shortlist.data.properties.some((item) => item.id === property.id))
  }, [property, shortlist.data])

  const images = useMemo<LightboxImage[]>(
    () =>
      (property?.images ?? []).map((image, index) => ({
        image,
        title: `${property?.title ?? 'Property'} — image ${index + 1}`,
        caption: `${humanStatus(property?.property_type ?? '')} · ${property?.location ?? ''}`,
      })),
    [property],
  )

  if (loading) {
    return (
      <div className="shell py-40">
        <Spinner label="Loading property" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="shell py-40">
        <ErrorNote message={error ?? 'This listing could not be found.'} onRetry={reload} />
        <Link to="/properties" className="link-arrow mt-8 inline-flex text-gold-deep">
          <IconArrow className="h-4 w-4 rotate-180" /> All properties
        </Link>
      </div>
    )
  }

  async function toggleSaved() {
    if (!property) return
    setSaveNotice(null)
    try {
      if (saved) {
        await api.del(`/me/saved/properties/${property.id}`)
        setSaved(false)
        setSaveNotice('Removed from your shortlist.')
      } else {
        await api.post(`/me/saved/properties/${property.id}`)
        setSaved(true)
        setSaveNotice('Saved to your shortlist.')
      }
      shortlist.reload()
    } catch (err) {
      setSaveNotice(err instanceof ApiError ? err.message : 'Your shortlist could not be updated.')
    }
  }

  const facts = [
    { label: 'Type', value: humanStatus(property.property_type) },
    { label: 'Transaction', value: property.transaction_type === 'rent' ? 'To rent' : 'For sale' },
    { label: 'Status', value: humanStatus(property.listing_status) },
    { label: 'Internal area', value: formatArea(property.area_sqm) },
    {
      label: 'Bedrooms',
      value: property.bedrooms === null ? '—' : String(property.bedrooms),
    },
    {
      label: 'Bathrooms',
      value: property.bathrooms === null ? '—' : String(property.bathrooms),
    },
    { label: 'Furnishing', value: property.furnished ? humanStatus(property.furnished) : '—' },
    { label: 'Reference', value: property.reference },
  ]

  const others = (related.data?.items ?? []).filter((item) => item.id !== property.id).slice(0, 3)

  return (
    <>
      <section className="bg-evergreen pt-32 text-ivory lg:pt-36">
        <div className="shell pb-10">
          <Link to="/properties" className="link-arrow mb-8 inline-flex text-ivory/70 hover:text-gold">
            <IconArrow className="h-4 w-4 rotate-180" /> All properties
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
            <div>
              <p className="eyebrow text-gold">
                {property.transaction_type === 'rent' ? 'To rent' : 'For sale'} · {humanStatus(property.property_type)}
              </p>
              <h1 className="mt-5 text-ivory">{property.title}</h1>
              <p className="mt-4 text-ivory/75">{property.location}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                {property.is_demo && <DemoTag />}
                <span className="font-sans text-[0.62rem] uppercase tracking-label text-ivory/60">
                  Ref {property.reference}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <div className="text-right">
                <p className="font-sans text-[0.62rem] uppercase tracking-label text-ivory/55">Guide price</p>
                <p className="mt-1 font-sans text-sm uppercase tracking-label text-ivory">
                  {formatPrice(property.price, property.currency, property.price_period)}
                </p>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={toggleSaved}
                  aria-pressed={saved}
                  className={
                    saved
                      ? 'btn border-gold bg-gold text-white'
                      : 'btn border-ivory/40 text-ivory hover:bg-ivory/10'
                  }
                >
                  <IconHeart className="h-4 w-4" filled={saved} /> {saved ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </div>

          {saveNotice && (
            <p className="mt-5 font-sans text-[0.66rem] uppercase tracking-label text-gold" role="status">
              {saveNotice}
            </p>
          )}
        </div>

        {images.length > 0 && (
          <div className="shell grid gap-3 pb-12 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="group overflow-hidden bg-forest text-left"
              aria-label="Open the first image in the viewer"
            >
              <Img src={images[0].image} alt={property.title} ratio="16 / 10" className="card-hover" priority />
            </button>
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                {images.slice(1, 3).map((image, index) => (
                  <button
                    key={image.image}
                    type="button"
                    onClick={() => setLightboxIndex(index + 1)}
                    className="card-hover group overflow-hidden bg-forest"
                    aria-label={`Open image ${index + 2} in the viewer`}
                  >
                    <Img src={image.image} alt={`${property.title} — view ${index + 2}`} ratio="4 / 3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div>
            <p className="eyebrow">Overview</p>
            <span className="rule mt-4" />
            <p className="mt-6 max-w-prose text-[1.05rem] leading-relaxed text-ink/80">{property.excerpt}</p>

            <dl className="mt-10 grid grid-cols-2 gap-px border-y border-hairline sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="px-0 py-5 sm:border-l sm:border-hairline sm:px-5 sm:first:border-l-0">
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">{fact.label}</dt>
                  <dd className="mt-2 font-serif text-lg text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {property.description && (
              <div className="prose-editorial mt-10">
                {property.description.split(/\n{2,}/).map((block, index) => (
                  <p key={index}>{block.trim()}</p>
                ))}
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">Features &amp; amenities</p>
                <span className="rule mt-4" />
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <li key={amenity} className="flex gap-3 text-sm text-ink/75">
                      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold/70" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(property.floor_plans.length > 0 || property.documents.length > 0) && (
              <div className="mt-12">
                <p className="eyebrow">Documents</p>
                <span className="rule mt-4" />
                <ul className="mt-7 space-y-3">
                  {[...property.floor_plans, ...property.documents].map((item) => (
                    <li key={`${item.label}-${item.url}`}>
                      <a
                        href={item.url}
                        className="link-arrow text-gold-deep hover:text-ink"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label} <IconArrow className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-warmgray">
                  Demonstration links — replace with hosted documents before launch.
                </p>
              </div>
            )}

            <div className="mt-12">
              <p className="eyebrow">Location</p>
              <span className="rule mt-4" />
              <p className="mt-6 text-sm text-ink/75">
                {property.address ?? property.location}
                {property.latitude !== null && property.longitude !== null && (
                  <span className="mt-1 block text-warmgray">
                    Coordinates {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                  </span>
                )}
              </p>
              <p className="mt-4 text-xs text-warmgray">
                {settings?.contact.map_note ?? 'A map appears once a verified address is configured.'}
              </p>
            </div>

            {property.project_id !== null && (
              <p className="mt-10 text-sm text-ink/70">
                Part of a development in our portfolio —{' '}
                <Link to="/projects" className="text-gold-deep underline">
                  view the project
                </Link>
                .
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-hairline bg-white p-6 sm:p-8">
              <InquiryForm
                source="property"
                propertyId={property.id}
                heading="Arrange a viewing"
                intro="Tell us when suits you and the team will confirm a time."
                defaultInquiryType="Viewing request"
                defaultMessage={`I would like to arrange a viewing of ${property.title} (ref ${property.reference}).`}
                messageLabel="Your request"
                submitLabel="Request a viewing"
                compact
              />
            </div>
            <p className="mt-4 text-xs text-warmgray">
              Reference {property.reference} is attached to your enquiry automatically.
            </p>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-ivory py-20 lg:py-24">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">More in {property.location}</p>
                <span className="rule mt-4" />
                <h2 className="mt-5">Similar Listings.</h2>
              </div>
              <Link to="/properties" className="link-arrow text-gold-deep hover:text-ink">
                All properties <IconArrow className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {images.length === 0 && (
        <section className="shell pb-20">
          <EmptyState
            title="No images on this listing yet"
            copy="Photography can be added from the administration area."
          />
        </section>
      )}

      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  )
}
