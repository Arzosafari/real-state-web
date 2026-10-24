import { ProjectCard } from '@/components/cards'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState, ErrorNote, Spinner } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import type { Page, Project } from '@/lib/types'

export function FeaturedProjects() {
  const { data, loading, error, reload } = useApi<Page<Project>>('/projects', {
    featured: true,
    page_size: 4,
  })

  return (
    <section className="bg-ivory py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading
          eyebrow="Featured projects"
          title={
            <>
              Distinctive Places.
              <br />
              Lasting Value.
            </>
          }
          copy="From residences to mixed-use destinations, our projects are designed for people, place, and progress."
          link={{ label: 'View all projects', to: '/projects' }}
        />

        <div>
          {loading && <Spinner label="Loading projects" />}
          {error && <ErrorNote message={error} onRetry={reload} />}
          {!loading && !error && data && data.items.length === 0 && (
            <EmptyState
              title="No featured projects yet"
              copy="Projects marked as featured in the administration area appear here."
            />
          )}
          {!loading && !error && data && data.items.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {data.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
