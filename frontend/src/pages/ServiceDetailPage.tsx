import { Link, useParams } from 'react-router-dom'

import { InquiryForm } from '@/components/forms/InquiryForm'
import { IconArrow, ServiceIcon } from '@/components/icons'
import { ErrorNote, Reveal, Spinner } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { splitParagraphs } from '@/lib/format'
import type { Service } from '@/lib/types'

export function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const { data: service, loading, error, reload } = useApi<Service>(`/services/${slug}`)

  usePageMeta({
    title: service?.title ?? 'Service',
    description: service?.summary,
    image: service?.image,
  })

  if (loading) {
    return (
      <div className="shell py-40">
        <Spinner label="Loading service" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="shell py-40">
        <ErrorNote message={error ?? 'This service could not be found.'} onRetry={reload} />
        <Link to="/services" className="link-arrow mt-8 inline-flex text-gold-deep">
          <IconArrow className="h-4 w-4 rotate-180" /> All services
        </Link>
      </div>
    )
  }

  const paragraphs = splitParagraphs(service.description)

  return (
    <>
      <PageHero
        eyebrow={`Service · ${service.title}`}
        title={service.title}
        copy={service.summary}
        breadcrumb={{ label: 'Services', to: '/services' }}
        image={service.image}
        imageAlt={service.title}
      />

      <section className="bg-soft py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <ServiceIcon name={service.icon} className="h-8 w-8 text-gold-deep" />
            <div className="prose-editorial mt-8">
              {paragraphs.map((block, index) =>
                block.type === 'h2' ? (
                  <h2 key={`${block.text}-${index}`}>{block.text}</h2>
                ) : (
                  <p key={`${block.text.slice(0, 24)}-${index}`}>{block.text}</p>
                ),
              )}
            </div>

            {service.deliverables.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">What you get</p>
                <span className="rule mt-4" />
                <ul className="mt-7 space-y-4">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex gap-4 text-sm text-ink/80">
                      <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-gold/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.process.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">How it runs</p>
                <span className="rule mt-4" />
                <ol className="mt-7 space-y-8">
                  {service.process.map((step) => (
                    <li key={step.step} className="border-t border-hairline pt-5">
                      <p className="font-sans text-[0.62rem] uppercase tracking-label text-gold-deep">
                        {step.step}
                      </p>
                      <h3 className="mt-3 font-serif text-xl">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.copy}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {service.related_project_slugs.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">Related projects</p>
                <span className="rule mt-4" />
                <ul className="mt-7 flex flex-wrap gap-3">
                  {service.related_project_slugs.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/projects/${item}`}
                        className="inline-flex border border-hairline px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label text-ink hover:border-gold hover:text-gold-deep"
                      >
                        {item.replace(/-/g, ' ')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-hairline bg-white p-6 sm:p-8">
              <InquiryForm
                source="services"
                heading={`Enquire about ${service.title.toLowerCase()}`}
                intro="Send a short brief and we will suggest the right starting point."
                submitLabel="Send enquiry"
                compact
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
