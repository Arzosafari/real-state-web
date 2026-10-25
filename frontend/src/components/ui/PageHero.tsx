import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { Img, cx } from '@/components/ui/Primitives'

interface PageHeroProps {
  eyebrow: string
  title: ReactNode
  copy?: string
  image?: string | null
  imageAlt?: string
  breadcrumb?: { label: string; to: string }
  actions?: ReactNode
  aside?: ReactNode
  compact?: boolean
}

/**
 * The dark opening band used by every inner page, so the interior of the site
 * reads the same way as the home page hero.
 */
export function PageHero({
  eyebrow,
  title,
  copy,
  image,
  imageAlt,
  breadcrumb,
  actions,
  aside,
  compact,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-evergreen text-ivory">
      {image && (
        <div className="absolute inset-0">
          <Img
            src={image}
            alt={imageAlt ?? ''}
            wrapperClassName="h-full w-full"
            ratio="16 / 9"
            priority
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(104deg, rgba(11,27,22,0.95) 0%, rgba(11,27,22,0.82) 42%, rgba(11,27,22,0.45) 78%, rgba(11,27,22,0.6) 100%)',
            }}
          />
        </div>
      )}

      <div
        className={cx(
          'relative shell',
          compact ? 'pb-14 pt-32 sm:pt-36' : 'pb-16 pt-36 sm:pt-40 lg:pb-20',
        )}
      >
        {breadcrumb && (
          <Link
            to={breadcrumb.to}
            className="link-arrow mb-8 inline-flex text-ivory/70 hover:text-gold"
          >
            <IconArrow className="h-4 w-4 rotate-180" /> {breadcrumb.label}
          </Link>
        )}

        <div className={cx('grid gap-10', aside && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]')}>
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow text-gold">{eyebrow}</p>
            <span className="rule mt-4 bg-gold/70" />
            <h1 className="mt-5 text-ivory">{title}</h1>
            {copy && <p className="mt-6 max-w-prose text-[1.02rem] leading-relaxed text-ivory/75">{copy}</p>}
            {actions && <div className="mt-9 flex flex-wrap gap-4">{actions}</div>}
          </div>
          {aside && <div className="lg:pt-10">{aside}</div>}
        </div>
      </div>
    </section>
  )
}
