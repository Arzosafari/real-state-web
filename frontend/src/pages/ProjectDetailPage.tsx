import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ProjectCard } from '@/components/cards'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { IconArrow } from '@/components/icons'
import { DemoTag, ErrorNote, Img, Reveal, Spinner } from '@/components/ui/Primitives'
import { Lightbox, type LightboxImage } from '@/components/ui/Lightbox'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatDate, formatPrice } from '@/lib/format'
import type { Project } from '@/lib/types'

export function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data: project, loading, error, reload } = useApi<Project>(`/projects/${slug}`)
  const related = useApi<Project[]>(project ? `/projects/${slug}/related` : null)

  usePageMeta({
    title: project?.seo_title ?? project?.title ?? 'Project',
    description: project?.seo_description ?? project?.overview,
    image: project?.hero_image,
  })

  const gallery = useMemo<LightboxImage[]>(
    () =>
      [...(project?.gallery ?? [])].map((image, index) => ({
        image,
        title: `${project?.title ?? 'Project'} — ${index + 1} of ${project?.gallery.length ?? 0}`,
        caption: project?.tagline,
      })),
    [project],
  )

  if (loading) {
    return (
      <div className="shell py-40">
        <Spinner label="Loading project" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="shell py-40">
        <ErrorNote message={error ?? 'This project could not be found.'} onRetry={reload} />
        <Link to="/projects" className="link-arrow mt-8 inline-flex text-gold-deep">
          <IconArrow className="h-4 w-4 rotate-180" /> All projects
        </Link>
      </div>
    )
  }

  const facts = [
    { label: 'Category', value: project.category },
    { label: 'Status', value: project.status },
    { label: 'Location', value: project.location },
    { label: 'Total area', value: project.total_area_sqm ? `${project.total_area_sqm.toLocaleString()} m²` : '—' },
    { label: 'Units', value: project.unit_count ? String(project.unit_count) : '—' },
    { label: 'Bedrooms', value: project.bedrooms_range ?? '—' },
    { label: 'Completion', value: project.completion_date ? formatDate(project.completion_date) : 'To be confirmed' },
    { label: 'Price from', value: project.price_from ? formatPrice(project.price_from, project.currency) : 'On application' },
  ]

  return (
    <>
      <PageHero
        eyebrow={`${project.category} · ${project.location}`}
        title={project.title}
        copy={project.tagline}
        breadcrumb={{ label: 'Projects', to: '/projects' }}
        image={project.hero_image}
        imageAlt={project.title}
        actions={
          <>
            <Link to="/book-consultation" className="btn-gold">
              Enquire about this project <IconArrow className="h-4 w-4" />
            </Link>
            {project.hero_image && (
              <button type="button" className="btn-outline-light" onClick={() => setLightboxIndex(0)}>
                View gallery
              </button>
            )}
          </>
        }
      />

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="eyebrow">Overview</p>
              {project.is_demo && <DemoTag />}
            </div>
            <span className="rule mt-4" />
            <p className="mt-6 max-w-prose text-[1.05rem] leading-relaxed text-ink/80">{project.overview}</p>

            {project.description && (
              <div className="prose-editorial mt-8">
                {project.description.split(/\n{2,}/).map((block, index) => (
                  <p key={index}>{block.trim()}</p>
                ))}
              </div>
            )}

            <dl className="mt-12 grid grid-cols-2 gap-px border-y border-hairline sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="px-0 py-5 sm:border-l sm:border-hairline sm:px-5 sm:first:border-l-0">
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">{fact.label}</dt>
                  <dd className="mt-2 font-serif text-lg text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {project.design_concept && (
              <div className="mt-12">
                <p className="eyebrow">Design concept</p>
                <span className="rule mt-4" />
                <p className="mt-6 max-w-prose text-[1rem] leading-relaxed text-ink/80">
                  {project.design_concept}
                </p>
              </div>
            )}

            <div className="mt-12 grid gap-12 sm:grid-cols-2">
              {project.highlights.length > 0 && (
                <div>
                  <p className="eyebrow">Highlights</p>
                  <span className="rule mt-4" />
                  <ul className="mt-6 space-y-3">
                    {project.highlights.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-ink/75">
                        <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.amenities.length > 0 && (
                <div>
                  <p className="eyebrow">Amenities</p>
                  <span className="rule mt-4" />
                  <ul className="mt-6 space-y-3">
                    {project.amenities.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-ink/75">
                        <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {project.sustainability.length > 0 && (
              <div className="mt-12 border-t border-hairline pt-10">
                <p className="eyebrow">Sustainability</p>
                <span className="rule mt-4" />
                <ul className="mt-6 space-y-3">
                  {project.sustainability.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-ink/75">
                      <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.specifications.length > 0 && (
              <div className="mt-12 border-t border-hairline pt-10">
                <p className="eyebrow">Specifications</p>
                <span className="rule mt-4" />
                <dl className="mt-6 max-w-prose divide-y divide-hairline border-y border-hairline">
                  {project.specifications.map((item) => (
                    <div key={item.label} className="flex justify-between gap-6 py-4">
                      <dt className="font-sans text-[0.68rem] uppercase tracking-label text-warmgray">
                        {item.label}
                      </dt>
                      <dd className="text-sm text-ink/85">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {(project.developer || project.architect) && (
              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {project.developer && (
                  <div>
                    <p className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Developer</p>
                    <p className="mt-2 text-sm text-ink/80">{project.developer}</p>
                  </div>
                )}
                {project.architect && (
                  <div>
                    <p className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Architect</p>
                    <p className="mt-2 text-sm text-ink/80">{project.architect}</p>
                  </div>
                )}
              </div>
            )}

            {project.services.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">Services involved</p>
                <span className="rule mt-4" />
                <ul className="mt-6 flex flex-wrap gap-3">
                  {project.services.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/services/${item}`}
                        className="inline-flex border border-hairline px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label text-ink hover:border-gold hover:text-gold-deep"
                      >
                        {item.replace(/-/g, ' ')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-hairline bg-white p-6 sm:p-8">
              <InquiryForm
                source="project"
                projectId={project.id}
                heading="Enquire about this project"
                intro="Availability, floor plans and pricing are shared on request."
                defaultMessage={`I would like to know more about ${project.title}.`}
                submitLabel="Send enquiry"
                compact
              />
            </div>
            {project.availability_note && (
              <p className="mt-4 text-xs text-warmgray">{project.availability_note}</p>
            )}
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-ivory py-20 lg:py-24">
          <div className="shell">
            <p className="eyebrow">Gallery</p>
            <span className="rule mt-4" />
            <h2 className="mt-5">Inside the Scheme.</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <Reveal key={`${image.image}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="card-hover group block w-full overflow-hidden bg-forest"
                    aria-label={`Open image ${index + 1} in the viewer`}
                  >
                    <Img src={image.image} alt={`${project.title} — image ${index + 1}`} ratio="4 / 3" />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.data && related.data.length > 0 && (
        <section className="bg-soft py-20 lg:py-24">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Related work</p>
                <span className="rule mt-4" />
                <h2 className="mt-5">More {project.category} Projects.</h2>
              </div>
              <Link to="/projects" className="link-arrow text-gold-deep hover:text-ink">
                All projects <IconArrow className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.data.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightboxIndex !== null && gallery.length > 0 && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  )
}
