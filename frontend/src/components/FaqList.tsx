import { AccordionItem } from '@/components/ui/Accordion'
import { ErrorNote, Spinner } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import type { Faq } from '@/lib/types'

/** Frequently asked questions, read from the API so editors can change them. */
export function FaqList({ limit }: { limit?: number }) {
  const { data, loading, error, reload } = useApi<Faq[]>('/faqs')

  if (loading) return <Spinner label="Loading questions" />
  if (error) return <ErrorNote message={error} onRetry={reload} />
  if (!data || data.length === 0) return null

  const rows = limit ? data.slice(0, limit) : data

  return (
    <div className="border-t border-hairline">
      {rows.map((item) => (
        <AccordionItem key={item.id} question={item.question}>
          {item.answer}
        </AccordionItem>
      ))}
    </div>
  )
}
