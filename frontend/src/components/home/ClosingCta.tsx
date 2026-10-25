import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { useSite } from '@/context/SiteContext'

export function ClosingCta() {
  const { settings } = useSite()
  const contact = settings?.contact

  return (
    <section className="bg-evergreen py-20 text-ivory lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-20">
        <div>
          <p className="eyebrow text-gold">Next step</p>
          <span className="rule mt-4 bg-gold/70" />
          <h2 className="mt-5 text-ivory">
            Let&rsquo;s Shape
            <br />
            Your Next Place.
          </h2>
          <p className="mt-6 max-w-prose text-[1.02rem] text-ivory/75">
            Bring us a site, a brief or an early idea. We will tell you how we would approach it and
            who would be involved.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/book-consultation" className="btn-gold">
              Book a consultation <IconArrow className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-outline-light">
              Contact the team
            </Link>
          </div>
        </div>

        {contact && (
          <dl className="space-y-6 border-t border-ivory/20 pt-8">
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-ivory/55">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${contact.email}`} className="text-ivory hover:text-gold">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-ivory/55">Telephone</dt>
              <dd className="mt-2">
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-ivory hover:text-gold">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-ivory/55">Studio</dt>
              <dd className="mt-2 text-sm text-ivory/75">
                {contact.address}
                {contact.hours && <span className="mt-1 block text-ivory/55">{contact.hours}</span>}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}
