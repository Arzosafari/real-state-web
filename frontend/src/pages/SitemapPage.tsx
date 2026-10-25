import { Link } from 'react-router-dom'

import { ErrorNote, Spinner } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { ArticleSummary, Page, Project, Property, Service } from '@/lib/types'

function LinkGroup({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <span className="rule mt-4" />
      <ul className="mt-6 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-ink/80 hover:text-gold-deep">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SitemapPage() {
  const projects = useApi<Page<Project>>('/projects', { page_size: 60 })
  const properties = useApi<Page<Property>>('/properties', { page_size: 60 })
  const articles = useApi<Page<ArticleSummary>>('/articles', { page_size: 30 })
  const services = useApi<Service[]>('/services')

  usePageMeta({ title: 'Sitemap', description: 'Every page on the UrbanLedge website.' })

  const loading = projects.loading || properties.loading || articles.loading || services.loading
  const error = projects.error ?? properties.error ?? articles.error ?? services.error

  return (
    <>
      <PageHero
        eyebrow="Sitemap"
        title="Every Page, In One Place."
        copy="A plain index of the site for people who would rather scan a list than a menu."
        compact
      />

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell">
          {loading && <Spinner label="Loading the index" />}
          {error && (
            <ErrorNote
              message={error}
              onRetry={() => {
                projects.reload()
                properties.reload()
                articles.reload()
                services.reload()
              }}
            />
          )}

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <LinkGroup
              title="Company"
              links={[
                { label: 'Home', to: '/' },
                { label: 'About', to: '/about' },
                { label: 'Approach', to: '/approach' },
                { label: 'Contact', to: '/contact' },
                { label: 'Book a consultation', to: '/book-consultation' },
              ]}
            />
            <LinkGroup
              title="Browse"
              links={[
                { label: 'Projects', to: '/projects' },
                { label: 'Properties', to: '/properties' },
                { label: 'Services', to: '/services' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Insights', to: '/insights' },
              ]}
            />
            <LinkGroup
              title="Account"
              links={[
                { label: 'Sign in', to: '/login' },
                { label: 'Create an account', to: '/register' },
                { label: 'My account', to: '/account' },
                { label: 'Privacy policy', to: '/privacy' },
                { label: 'Terms of use', to: '/terms' },
              ]}
            />

            {services.data && services.data.length > 0 && (
              <LinkGroup
                title="Services"
                links={services.data.map((service) => ({ label: service.title, to: `/services/${service.slug}` }))}
              />
            )}
            {projects.data && projects.data.items.length > 0 && (
              <LinkGroup
                title="Projects"
                links={projects.data.items.map((project) => ({ label: project.title, to: `/projects/${project.slug}` }))}
              />
            )}
            {properties.data && properties.data.items.length > 0 && (
              <LinkGroup
                title="Properties"
                links={properties.data.items.map((property) => ({
                  label: property.title,
                  to: `/properties/${property.slug}`,
                }))}
              />
            )}
            {articles.data && articles.data.items.length > 0 && (
              <LinkGroup
                title="Insights"
                links={articles.data.items.map((article) => ({ label: article.title, to: `/insights/${article.slug}` }))}
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
