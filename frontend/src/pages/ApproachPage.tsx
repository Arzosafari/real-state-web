import { ClosingCta } from '@/components/home/ClosingCta'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { IconArrow, ServiceIcon } from '@/components/icons'
import { Img, Reveal } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useSite } from '@/context/SiteContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Link } from 'react-router-dom'

const COMMITMENTS = [
  {
    icon: 'leaf',
    title: 'Comfort before machinery',
    copy: 'Orientation, shading and cross-ventilation are decided before any system is specified.',
  },
  {
    icon: 'chart',
    title: 'Measured, then improved',
    copy: 'We set targets per project and report against them as the building is used.',
  },
  {
    icon: 'community',
    title: 'Shared ground as a priority',
    copy: 'The public and communal parts of a scheme are designed with the same care as the homes.',
  },
]

export function ApproachPage() {
  const { settings } = useSite()

  usePageMeta({
    title: 'Approach',
    description:
      'How UrbanLedge researches a site, sets ambitions early and carries them through to delivery.',
  })

  return (
    <>
      <PageHero
        eyebrow="Our approach"
        title={
          <>
            Research First.
            <br />
            Draw Second.
          </>
        }
        copy="A place is a set of constraints and opportunities. We spend the early weeks understanding them so the design can be simple later."
      />

      <section className="bg-soft py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">Method</p>
            <span className="rule mt-4" />
            <h2 className="mt-5">Four Questions, Every Project.</h2>
            <div className="prose-editorial mt-8">
              <p>
                Before a line is drawn we ask what the site already does well, who it will serve,
                what the city needs from it, and what it must be able to become in twenty years.
              </p>
              <p>
                Those answers become the brief. They are revisited at planning, at technical design
                and on site, which is how the ambition survives contact with budgets and
                contractors.
              </p>
            </div>
            <Link to="/services" className="link-arrow mt-8 inline-flex text-gold-deep hover:text-ink">
              What we do <IconArrow className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <Img
              src={settings?.stats?.image}
              alt="City at dusk seen from a rooftop"
              ratio="4 / 3"
            />
          </Reveal>
        </div>
      </section>

      <ProcessTimeline />

      <section className="bg-forest py-20 text-ivory lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Commitments"
            tone="dark"
            title="How We Judge a Building."
            copy="Three commitments we hold ourselves to on every scheme."
          />
          <div className="mt-12 grid gap-px border-y border-ivory/15 sm:grid-cols-2 xl:grid-cols-3">
            {COMMITMENTS.map((item) => (
              <article
                key={item.title}
                className="border-ivory/15 px-0 py-8 sm:border-l sm:px-6 sm:first:border-l-0"
              >
                <ServiceIcon name={item.icon} className="h-7 w-7 text-gold/80" />
                <h3 className="mt-6 font-sans text-[0.72rem] uppercase tracking-label text-ivory">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/70">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  )
}
