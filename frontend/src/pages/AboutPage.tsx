import { Link } from 'react-router-dom'

import { ClosingCta } from '@/components/home/ClosingCta'
import { StatsBand } from '@/components/home/StatsBand'
import { IconArrow, ServiceIcon } from '@/components/icons'
import { DemoTag, Img, Reveal } from '@/components/ui/Primitives'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useSite } from '@/context/SiteContext'
import { usePageMeta } from '@/hooks/usePageMeta'

const PRINCIPLES = [
  {
    icon: 'community',
    title: 'People first',
    copy: 'We start with how a place will be lived in — light, access, quiet, and the walk from the front door.',
  },
  {
    icon: 'leaf',
    title: 'Built to last',
    copy: 'Materials, servicing and structure are chosen for decades of use rather than a launch photograph.',
  },
  {
    icon: 'layers',
    title: 'One team',
    copy: 'Architecture, planning and development sit in the same room, so decisions are made once.',
  },
  {
    icon: 'building',
    title: 'Honest context',
    copy: 'Every site has a grain. We design with it instead of against it.',
  },
]

export function AboutPage() {
  const { settings } = useSite()
  const philosophy = settings?.philosophy
  const press = settings?.press

  usePageMeta({
    title: 'About',
    description:
      'UrbanLedge is a design-led development studio working across architecture, planning and property development.',
    image: philosophy?.image,
  })

  return (
    <>
      <PageHero
        eyebrow="About UrbanLedge"
        title={
          <>
            A Studio Built
            <br />
            Around Place.
          </>
        }
        copy="UrbanLedge brings architecture, urban planning and development together in one practice, so a project keeps its intent from first sketch to final handover."
        image={philosophy?.image}
        imageAlt="Contemporary pavilion with timber screens and a reflecting pool"
      />

      <section className="bg-soft py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Who we are</p>
            <span className="rule mt-4" />
            <h2 className="mt-5">
              Design,
              <br />
              Development,
              <br />
              Delivery.
            </h2>
            <div className="prose-editorial mt-8">
              <p>
                We work on residential neighbourhoods, mixed-use quarters and public buildings. Our
                teams research a site before drawing on it — its climate, its streets, the way people
                already move through it — and then hold that understanding through planning,
                construction and operation.
              </p>
              <p>
                Because the studio is involved from acquisition to handover, the ambitions set early
                are still visible in the finished building: shared ground that is genuinely
                usable, homes that can be adapted over time, and streets that belong to the city.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/approach" className="btn-outline-dark">
                Our approach <IconArrow className="h-4 w-4" />
              </Link>
              <Link to="/projects" className="link-arrow pt-3 text-gold-deep hover:text-ink">
                See the work <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Img
              src={philosophy?.image}
              alt="Model of a residential quarter on a studio table"
              ratio="4 / 5"
            />
            <figure className="mt-8 border-l border-gold/60 pl-6">
              <blockquote className="font-serif text-2xl leading-snug text-ink">
                “{philosophy?.quote ?? 'Great places are shaped by their context.'}”
              </blockquote>
              <figcaption className="mt-4 font-sans text-[0.64rem] uppercase tracking-label text-warmgray">
                {philosophy?.attribution ?? 'UrbanLedge'}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="How we work"
            title="Four Principles We Keep Returning To."
            copy="They are not slogans — they are the questions we ask at every design review."
          />
          <div className="mt-12 grid gap-px border-y border-hairline sm:grid-cols-2 xl:grid-cols-4">
            {PRINCIPLES.map((principle) => (
              <article key={principle.title} className="border-hairline px-0 py-8 sm:border-l sm:px-6 sm:first:border-l-0">
                <ServiceIcon name={principle.icon} className="h-7 w-7 text-gold-deep" />
                <h3 className="mt-6 font-sans text-[0.72rem] uppercase tracking-label text-ink">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">{principle.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      {press?.enabled && press.publications.length > 0 && (
        <section className="bg-soft py-16 lg:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-center gap-4">
              <p className="eyebrow">Press</p>
              <DemoTag />
            </div>
            {press.note && <p className="mt-4 max-w-prose text-xs text-warmgray">{press.note}</p>}
            <ul className="mt-8 grid gap-6 border-t border-hairline pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {press.publications.map((publication) => (
                <li
                  key={publication}
                  className="font-serif text-xl text-ink/45"
                  aria-label={`${publication} (placeholder wordmark)`}
                >
                  {publication}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingCta />
    </>
  )
}
