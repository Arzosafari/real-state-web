import { useState } from 'react'
import { Link } from 'react-router-dom'

import { IconArrow, IconSocial, UrbanLedgeMark } from '@/components/icons'
import { useSite } from '@/context/SiteContext'
import { ApiError, api } from '@/lib/api'

export function SiteFooter() {
  const { settings } = useSite()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const brand = settings?.brand
  const contact = settings?.contact
  const social = settings?.social ?? {}
  const columns = settings?.footer?.columns ?? []
  const year = new Date().getFullYear()

  async function subscribe(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    try {
      const result = await api.post<{ message: string }>('/newsletter', { email, consent: true })
      setState('done')
      setMessage(result.message)
      setEmail('')
    } catch (error) {
      setState('error')
      setMessage(error instanceof ApiError ? error.message : 'Subscription failed. Please try again.')
    }
  }

  return (
    <footer className="bg-evergreen text-ivory">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Link to="/" className="flex items-center gap-3" aria-label={`${brand?.name ?? 'UrbanLedge'} — home`}>
            <UrbanLedgeMark className="h-9 w-9 text-gold" />
            <span>
              <span className="block font-sans text-sm uppercase tracking-label">{brand?.name ?? 'UrbanLedge'}</span>
              <span className="block text-[0.6rem] uppercase tracking-label text-ivory/60">
                {brand?.tagline ?? 'People. Places. Possibility.'}
              </span>
            </span>
          </Link>

          <form className="mt-8 max-w-sm" onSubmit={subscribe} noValidate>
            <label htmlFor="footer-email" className="mb-2 block font-sans text-[0.62rem] uppercase tracking-label text-ivory/70">
              Journal &amp; project updates
            </label>
            <div className="flex">
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-ivory/25 bg-transparent px-3 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="btn border-gold bg-gold px-4 text-white hover:bg-gold-deep" disabled={state === 'sending'}>
                {state === 'sending' ? '…' : <IconArrow className="h-4 w-4" />}
                <span className="sr-only">Subscribe</span>
              </button>
            </div>
            {state === 'done' && <p className="mt-3 text-xs text-gold">{message}</p>}
            {state === 'error' && (
              <p className="mt-3 text-xs text-red-300" role="alert">
                {message}
              </p>
            )}
            <p className="mt-3 text-[0.68rem] leading-relaxed text-ivory/50">
              Demonstration sign-up: subscriptions are stored separately from enquiries and every
              message includes an unsubscribe link.
            </p>
          </form>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="eyebrow text-gold">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.to}-${link.label}`}>
                    <Link to={link.to} className="text-sm text-ivory/75 hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="eyebrow text-gold">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-ivory/75">
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="hover:text-gold">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="hover:text-gold">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.address && <li className="text-ivory/60">{contact.address}</li>}
              {contact?.hours && <li className="text-ivory/60">{contact.hours}</li>}
            </ul>
            <ul className="mt-6 flex gap-3">
              {Object.entries(social).map(([network, url]) => (
                <li key={network}>
                  <a
                    href={url || '#'}
                    aria-label={`${network} (placeholder link)`}
                    className="flex h-9 w-9 items-center justify-center border border-ivory/25 text-ivory/80 hover:border-gold hover:text-gold"
                  >
                    <IconSocial name={network} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-ivory/15 py-6 text-[0.68rem] uppercase tracking-label text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {brand?.name ?? 'UrbanLedge'}. {brand?.disclosure ?? 'Demonstration website.'}</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/privacy" className="hover:text-gold">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-gold">
            Terms
          </Link>
          <Link to="/sitemap" className="hover:text-gold">
            Sitemap
          </Link>
          <span className="font-serif text-sm normal-case tracking-normal text-ivory/70">
            {settings?.footer?.statement ?? 'A more livable tomorrow.'}
          </span>
        </div>
      </div>
    </footer>
  )
}
