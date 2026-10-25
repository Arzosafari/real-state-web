import { DemoTag, Img } from '@/components/ui/Primitives'
import { useSite } from '@/context/SiteContext'

/** Illustrative figures. The note beside them states that they are placeholders. */
export function StatsBand() {
  const { settings } = useSite()
  const stats = settings?.stats
  const items = stats?.items ?? []

  if (items.length === 0) return null

  return (
    <section className="bg-soft py-16 lg:py-20">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="eyebrow">By the numbers</p>
            <DemoTag />
          </div>
          <span className="rule mt-4" />
          <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="border-t border-hairline pt-5">
                <dt className="font-serif text-4xl leading-none text-ink lg:text-[2.6rem]">{item.value}</dt>
                <dd className="mt-3 font-sans text-[0.66rem] uppercase tracking-label text-warmgray">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
          {stats?.note && <p className="mt-8 max-w-prose text-xs text-warmgray">{stats.note}</p>}
        </div>

        {stats?.image && (
          <div className="overflow-hidden">
            <Img
              src={stats.image}
              alt="City skyline at dusk with contemporary buildings"
              ratio="4 / 3"
            />
          </div>
        )}
      </div>
    </section>
  )
}
