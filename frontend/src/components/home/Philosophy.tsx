import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { Img, Reveal } from '@/components/ui/Primitives'
import { useSite } from '@/context/SiteContext'

export function Philosophy() {
  const { settings } = useSite()
  const philosophy = settings?.philosophy

  return (
    <section className="bg-soft py-20 lg:py-28">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="lg:pt-6">
          <p className="eyebrow">Our design philosophy</p>
          <span className="rule mt-4" />
          <h2 className="mt-5">
            Context Inspires.
            <br />
            People Complete It.
          </h2>
          <p className="mt-6 max-w-prose text-[1rem] leading-relaxed text-ink/75">
            We design with a deep respect for place — creating buildings and neighborhoods that belong,
            perform, and inspire for generations.
          </p>
          <Link to="/approach" className="link-arrow mt-7 inline-flex text-gold-deep hover:text-ink">
            Our approach <IconArrow className="h-4 w-4" />
          </Link>
        </div>

        <Reveal>
          <div className="overflow-hidden">
            <Img
              src={philosophy?.image ?? '/images/philosophy/terrace-pavilion.jpg'}
              alt="Contemporary terrace pavilion with timber screens and a reflecting pool"
              ratio="4 / 3"
            />
          </div>
          <figure className="mt-8 border-l border-gold/60 pl-6 lg:ml-auto lg:max-w-md">
            <blockquote className="font-serif text-2xl leading-snug text-ink">
              “{philosophy?.quote ?? 'Great places are shaped by their context, enriched by their communities, and built to last.'}”
            </blockquote>
            <figcaption className="mt-4 font-sans text-[0.64rem] uppercase tracking-label text-warmgray">
              {philosophy?.attribution ?? 'UrbanLedge'}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
