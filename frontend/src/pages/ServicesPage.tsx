import { Link } from 'react-router-dom'

import { ClosingCta } from '@/components/home/ClosingCta'
import { IconArrow, ServiceIcon } from '@/components/icons'
import { EmptyState, ErrorNote, Img, Spinner } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { Service } from '@/lib/types'

export function ServicesPage() {
  const { data, loading, error, reload } = useApi<Service[]>('/services')

  usePageMeta({
    title: 'Services',
    description:
      'Architecture, property development, urban planning and advisory services from UrbanLedge.',
  })

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            One Practice.
            <br />
            Four Disciplines.
          </>
        }
        copy="Engage a single service or the whole team. Either way you work with the same people from brief to handover."
      />

      <section className="bg-soft py-20 lg:py-28">
        <div className="shell space-y-16">
          {loading && <Spinner label="Loading services" />}
          {error && <ErrorNote message={error} onRetry={reload} />}
          {data && data.length === 0 && (
            <EmptyState
              title="No services published yet"
              copy="Services added in the administration area appear here."
            />
          )}

          {data?.map((service, index) => (
            <article
              key={service.id}
              className="grid gap-10 border-t border-hairline pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
                <div className="flex items-center gap-4">
                  <ServiceIcon name={service.icon} className="h-8 w-8 text-gold-deep" />
                  <span className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="mt-6">{service.title}</h2>
                <p className="mt-5 max-w-prose text-[1.02rem] leading-relaxed text-ink/75">
                  {service.summary}
                </p>
                {service.deliverables.length > 0 && (
                  <ul className="mt-7 space-y-3">
                    {service.deliverables.slice(0, 4).map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-ink/75">
                        <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={`/services/${service.slug}`}
                  className="link-arrow mt-8 inline-flex text-gold-deep hover:text-ink"
                >
                  About this service <IconArrow className="h-4 w-4" />
                </Link>
              </div>

              <div className={index % 2 === 1 ? 'lg:order-1' : undefined}>
                <Img src={service.image} alt={service.title} ratio="4 / 3" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <ClosingCta />
    </>
  )
}
