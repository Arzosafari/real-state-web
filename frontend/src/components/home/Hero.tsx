import { Link } from 'react-router-dom'

import { IconArrow, ServiceIcon } from '@/components/icons'
import { Img } from '@/components/ui/Primitives'
import { useSite } from '@/context/SiteContext'

export function Hero() {
  const { settings } = useSite()
  const hero = settings?.hero

  const eyebrow = hero?.eyebrow ?? 'Architecture / Development / Stronger Cities'
  const headline = hero?.headline ?? 'Shaping Better Living.'
  const description =
    hero?.description ??
    'UrbanLedge designs and develops inspiring places where architecture, community, and long-term value come together.'
  const features = hero?.features ?? []
  const sideLabel = hero?.side_label ?? ['Places', 'That', 'Endure']

  return (
    <section className="relative isolate overflow-hidden bg-evergreen text-ivory">
      <div className="absolute inset-0">
        <Img
          src={hero?.image ?? '/images/hero/hero-dusk.jpg'}
          alt="Contemporary residential development at dusk, with the city beyond"
          className="h-full w-full"
          wrapperClassName="h-full w-full"
          ratio="16 / 9"
          priority
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(100deg, rgba(11,27,22,0.94) 0%, rgba(11,27,22,0.78) 38%, rgba(11,27,22,0.25) 68%, rgba(11,27,22,0.45) 100%)',
          }}
        />
      </div>

      <div className="relative shell flex min-h-[88vh] flex-col justify-between pb-10 pt-36 sm:pt-40 lg:min-h-[86vh]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="max-w-2xl animate-rise">
            <p className="eyebrow text-gold">{eyebrow}</p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">{headline}</h1>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-ivory/80">{description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/projects" className="btn-gold">
                Explore our work <IconArrow className="h-4 w-4" />
              </Link>
              <Link to="/approach" className="btn-outline-light">
                Our approach
              </Link>
            </div>
          </div>

          <div className="hidden text-right lg:block">
            <p className="font-sans text-[0.68rem] uppercase leading-[2.2] tracking-wide2 text-ivory/70">
              {sideLabel.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <span className="mt-5 ml-auto block h-px w-24 bg-gold/70" />
          </div>
        </div>

        <dl className="mt-16 grid gap-px border-t border-ivory/20 pt-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 pr-6">
              <ServiceIcon name={feature.icon} className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <dt className="font-sans text-[0.66rem] uppercase tracking-label text-ivory">
                  {feature.title}
                </dt>
                <dd className="mt-1 text-sm text-ivory/70">{feature.copy}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
