import { Link, useParams } from 'react-router-dom'

import { ArticleCard } from '@/components/cards'
import { IconArrow } from '@/components/icons'
import { ErrorNote, Img, Spinner } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatDate, splitParagraphs } from '@/lib/format'
import type { Article, ArticleSummary } from '@/lib/types'

export function ArticlePage() {
  const { slug = '' } = useParams()

  const { data: article, loading, error, reload } = useApi<Article>(`/articles/${slug}`)
  const related = useApi<ArticleSummary[]>(article ? `/articles/${slug}/related` : null)

  usePageMeta({
    title: article?.seo_title ?? article?.title ?? 'Insight',
    description: article?.seo_description ?? article?.excerpt,
    image: article?.cover_image,
    type: 'article',
  })

  if (loading) {
    return (
      <div className="shell py-40">
        <Spinner label="Loading article" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="shell py-40">
        <ErrorNote message={error ?? 'This article could not be found.'} onRetry={reload} />
        <Link to="/insights" className="link-arrow mt-8 inline-flex text-gold-deep">
          <IconArrow className="h-4 w-4 rotate-180" /> All insights
        </Link>
      </div>
    )
  }

  const blocks = splitParagraphs(article.content)

  return (
    <>
      <PageHero
        eyebrow={`${article.category} · ${article.reading_minutes} min read`}
        title={article.title}
        breadcrumb={{ label: 'Insights', to: '/insights' }}
        image={article.cover_image}
        imageAlt={article.title}
        compact
        aside={
          <dl className="space-y-5 border-t border-ivory/20 pt-6">
            <div>
              <dt className="font-sans text-[0.6rem] uppercase tracking-label text-ivory/55">Author</dt>
              <dd className="mt-2 text-sm text-ivory/85">{article.author}</dd>
            </div>
            <div>
              <dt className="font-sans text-[0.6rem] uppercase tracking-label text-ivory/55">Published</dt>
              <dd className="mt-2 text-sm text-ivory/85">{formatDate(article.published_at)}</dd>
            </div>
          </dl>
        }
      />

      <article className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-20">
          <div className="max-w-3xl">
            {article.excerpt && (
              <p className="border-l border-gold/60 pl-6 font-serif text-2xl leading-snug text-ink">
                {article.excerpt}
              </p>
            )}
            <div className="prose-editorial mt-10">
              {blocks.length > 0 ? (
                blocks.map((block, index) =>
                  block.type === 'h2' ? (
                    <h2 key={`${block.text}-${index}`}>{block.text}</h2>
                  ) : (
                    <p key={`${block.text.slice(0, 24)}-${index}`}>{block.text}</p>
                  ),
                )
              ) : (
                <p>This article has no body copy yet.</p>
              )}
            </div>
            <p className="mt-12 border-t border-hairline pt-6 text-xs text-warmgray">
              Demonstration editorial content. Replace it with your own writing before launch.
            </p>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            {article.cover_image && <Img src={article.cover_image} alt={article.title} ratio="4 / 5" />}
            <Link
              to="/book-consultation"
              className="btn-outline-dark mt-6 w-full"
            >
              Discuss a project
            </Link>
          </aside>
        </div>
      </article>

      {related.data && related.data.length > 0 && (
        <section className="bg-ivory py-20 lg:py-24">
          <div className="shell">
            <p className="eyebrow">Keep reading</p>
            <span className="rule mt-4" />
            <h2 className="mt-5">Related Insights.</h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.data.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
