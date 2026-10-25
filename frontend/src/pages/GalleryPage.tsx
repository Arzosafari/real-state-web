import { useMemo, useState } from 'react'

import { Img, EmptyState, ErrorNote, Spinner, cx } from '@/components/ui/Primitives'
import { Lightbox, type LightboxImage } from '@/components/ui/Lightbox'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { humanStatus } from '@/lib/format'
import type { GalleryImage } from '@/lib/types'

export function GalleryPage() {
  const [category, setCategory] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const categories = useApi<string[]>('/gallery/categories')
  const { data, loading, error, reload } = useApi<GalleryImage[]>('/gallery', {
    category: category || undefined,
  })

  usePageMeta({
    title: 'Gallery',
    description: 'Architecture, interiors and placemaking images from the UrbanLedge portfolio.',
  })

  const images = useMemo<LightboxImage[]>(
    () =>
      (data ?? []).map((item) => ({
        image: item.image,
        title: item.title || 'UrbanLedge gallery',
        caption: item.caption,
        credit: item.credit,
      })),
    [data],
  )

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={
          <>
            Architecture,
            <br />
            Interiors, Place.
          </>
        }
        copy="A cross-section of the studio's work, illustrated with licensed stock photography until project photography is supplied."
        compact
      />

      <section className="bg-soft pb-20 pt-10 lg:pb-28">
        <div className="shell">
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline pb-6">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={cx(
                'border px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label',
                category === '' ? 'border-gold bg-gold text-white' : 'border-hairline text-ink hover:border-gold',
              )}
              aria-pressed={category === ''}
            >
              All
            </button>
            {(categories.data ?? []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cx(
                  'border px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label',
                  category === item ? 'border-gold bg-gold text-white' : 'border-hairline text-ink hover:border-gold',
                )}
                aria-pressed={category === item}
              >
                {humanStatus(item)}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {loading && <Spinner label="Loading gallery" />}
            {error && <ErrorNote message={error} onRetry={reload} />}
            {!loading && !error && data && data.length === 0 && (
              <EmptyState
                title="No images in this category"
                copy="Choose another category or add images from the administration area."
              />
            )}
            {data && data.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className={cx(
                      'card-hover group block overflow-hidden bg-forest text-left',
                      index % 5 === 0 && 'sm:col-span-2',
                    )}
                    aria-label={`Open ${item.title || 'image'} in the viewer`}
                  >
                    <Img
                      src={item.image}
                      alt={item.title || 'UrbanLedge gallery image'}
                      ratio={index % 5 === 0 ? '16 / 9' : '4 / 5'}
                    />
                    <span className="mt-3 block">
                      <span className="block font-serif text-lg text-ink">{item.title}</span>
                      {item.caption && (
                        <span className="mt-1 block text-sm text-ink/65">{item.caption}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

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
