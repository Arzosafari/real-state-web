import { ArticleCard } from '@/components/cards'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ErrorNote, Spinner } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import type { ArticleSummary, Page } from '@/lib/types'

export function InsightsPreview() {
  const { data, loading, error, reload } = useApi<Page<ArticleSummary>>('/articles', { page_size: 3 })

  return (
    <section className="bg-soft py-20 lg:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Insights"
          title={
            <>
              Ideas That
              <br />
              Shape Places.
            </>
          }
          copy="Notes from our teams on design, development and the cities we build in."
          link={{ label: 'All insights', to: '/insights' }}
        />

        <div className="mt-12">
          {loading && <Spinner label="Loading insights" />}
          {error && <ErrorNote message={error} onRetry={reload} />}
          {data && data.items.length > 0 && (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
