import { Link } from 'react-router-dom'

import { IconArrow, ServiceIcon } from '@/components/icons'
import { ErrorNote, Spinner } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import type { Service } from '@/lib/types'

export function ServicesBand() {
  const { data, loading, error, reload } = useApi<Service[]>('/services')

  return (
    <section className="bg-forest py-20 text-ivory lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="eyebrow text-gold">Our services</p>
          <span className="rule mt-4 bg-gold/70" />
          <h2 className="mt-5 text-ivory">
            Integrated Expertise
            <br />
            for a Brighter Tomorrow.
          </h2>
          <Link to="/services" className="link-arrow mt-6 inline-flex text-gold hover:text-ivory">
            All services <IconArrow className="h-4 w-4" />
          </Link>
        </div>

        <div>
          {loading && <Spinner label="Loading services" />}
          {error && <ErrorNote message={error} onRetry={reload} />}
          {data && (
            <div className="grid gap-px border-y border-ivory/15 sm:grid-cols-2 xl:grid-cols-4">
              {data.map((service) => (
                <article
                  key={service.id}
                  className="group flex flex-col border-ivory/15 px-0 py-8 transition-colors duration-base sm:border-l sm:px-6 sm:first:border-l-0"
                >
                  <ServiceIcon name={service.icon} className="h-7 w-7 text-gold/80" />
                  <h3 className="mt-6 font-sans text-[0.72rem] uppercase tracking-label text-ivory">
                    {service.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ivory/70">{service.summary}</p>
                  <Link
                    to={`/services/${service.slug}`}
                    className="link-arrow mt-6 inline-flex text-gold transition-transform duration-base group-hover:translate-x-1"
                  >
                    Learn more <IconArrow className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
