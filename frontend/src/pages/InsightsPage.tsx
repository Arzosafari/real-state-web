import { useEffect, useState } from 'react'

import { ArticleCard } from '@/components/cards'
import { EmptyState, ErrorNote, Pagination, Spinner, cx } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { humanStatus } from '@/lib/format'
import type { ArticleSummary, Page } from '@/lib/types'

export function InsightsPage() {
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const categories = useApi<string[]>('/articles/categories')
  const { data, loading, error, reload } = useApi<Page<ArticleSummary>>('/articles', {
    category: category || undefined,
    page,
    page_size: 6,
  })

  usePageMeta({
    title: 'Insights',
    description:
      'Notes and commentary from UrbanLedge on design, development, planning and the cities we work in.',
  })

  useEffect(() => {
    setPage(1)
  }, [category])

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Thinking
            <br />
            Out Loud.
          </>
        }
        copy="Short, practical writing from the teams working on our projects — no trends, no filler."
        compact
      />

      <section className="bg-soft pb-20 pt-10 lg:pb-28">
        <div className="shell">
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline pb-6">
            <button
              type="button"
              onClick={() => setCategory('')}
              aria-pressed={category === ''}
              className={cx(
                'border px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label',
                category === '' ? 'border-gold bg-gold text-white' : 'border-hairline text-ink hover:border-gold',
              )}
            >
              All
            </button>
            {(categories.data ?? []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cx(
                  'border px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label',
                  category === item ? 'border-gold bg-gold text-white' : 'border-hairline text-ink hover:border-gold',
                )}
              >
                {humanStatus(item)}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {loading && <Spinner label="Loading insights" />}
            {error && <ErrorNote message={error} onRetry={reload} />}
            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title="Nothing published in this category"
                copy="Try another category, or check back after the next editorial cycle."
              />
            )}
            {data && data.items.length > 0 && (
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((article) => (
                  <ArticleCard key={article.id} article={article} />
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
