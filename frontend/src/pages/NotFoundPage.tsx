import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { usePageMeta } from '@/hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true })

  return (
    <section className="bg-evergreen text-ivory">
      <div className="shell flex min-h-[70vh] flex-col justify-center py-32">
        <p className="eyebrow text-gold">Error 404</p>
        <span className="rule mt-4 bg-gold/70" />
        <h1 className="mt-5 text-ivory">This page has moved on.</h1>
        <p className="mt-6 max-w-prose text-[1.02rem] text-ivory/75">
          The address you followed does not exist on this site. The links below will take you back to
          the places people look for most.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link to="/" className="btn-gold">
            Back to home <IconArrow className="h-4 w-4" />
          </Link>
          <Link to="/properties" className="btn-outline-light">
            Browse properties
          </Link>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-ivory/20 pt-8 font-sans text-[0.68rem] uppercase tracking-label">
          {[
            { label: 'Projects', to: '/projects' },
            { label: 'Services', to: '/services' },
            { label: 'Insights', to: '/insights' },
            { label: 'Gallery', to: '/gallery' },
            { label: 'Contact', to: '/contact' },
            { label: 'Sitemap', to: '/sitemap' },
          ].map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="text-ivory/80 hover:text-gold">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
