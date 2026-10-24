import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { IconArrow } from '@/components/icons'
import { cx } from '@/components/ui/Primitives'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  copy?: string
  link?: { label: string; to: string }
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  link,
  align = 'left',
  tone = 'light',
  className,
}: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <div className={cx(align === 'center' && 'mx-auto text-center', className)}>
      <p className={cx('eyebrow', dark && 'text-gold')}>{eyebrow}</p>
      <span className={cx('rule mt-4', align === 'center' && 'mx-auto', dark && 'bg-gold/70')} />
      <h2 className={cx('mt-5', dark ? 'text-ivory' : 'text-ink')}>{title}</h2>
      {copy && (
        <p className={cx('mt-5 max-w-prose text-[0.98rem]', dark ? 'text-ivory/75' : 'text-ink/75')}>{copy}</p>
      )}
      {link && (
        <Link
          to={link.to}
          className={cx('link-arrow mt-6 inline-flex', dark ? 'text-gold hover:text-ivory' : 'text-gold-deep hover:text-ink')}
        >
          {link.label} <IconArrow className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
