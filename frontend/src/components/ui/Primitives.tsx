import { useEffect, useRef, useState, type ReactNode } from 'react'

import { IconAlert, IconArrow, IconCheck } from '@/components/icons'

export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}

interface ImgProps {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  ratio?: string
  priority?: boolean
}

/**
 * Image with a graceful, clearly-artificial placeholder: if an asset is
 * missing the layout keeps its shape instead of showing a broken image icon.
 */
export function Img({ src, alt, className, wrapperClassName, ratio = '4 / 3', priority }: ImgProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div
        className={cx('relative overflow-hidden bg-forest', wrapperClassName)}
        style={{ aspectRatio: ratio }}
        role="img"
        aria-label={`${alt} (illustrative placeholder)`}
      >
        <span
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(160deg, rgba(16,44,59,0.95) 0%, rgba(16,43,32,0.98) 55%, rgba(11,27,22,1) 100%)',
          }}
        />
        <span
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(182,160,106,0.5) 0 1px, transparent 1px 46px)',
          }}
        />
        <span className="absolute bottom-3 left-3 font-sans text-[0.6rem] uppercase tracking-label text-ivory/60">
          Image placeholder
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onError={() => setFailed(true)}
      className={cx('h-full w-full object-cover', className)}
      style={wrapperClassName ? undefined : { aspectRatio: ratio }}
    />
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/** Restrained scroll-in reveal; content is visible when motion is reduced. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cx('transition-all duration-700 ease-out', shown ? 'opacity-100' : 'opacity-0', className)}
      style={shown ? { transform: 'none', transitionDelay: `${delay}ms` } : { transform: 'translateY(18px)', transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-warmgray" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
      <span className="font-sans text-xs uppercase tracking-label">{label}</span>
    </div>
  )
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-hairline bg-white/60 px-4 py-3 text-sm text-ink/80" role="alert">
      <IconAlert className="h-4 w-4 text-gold-deep" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="link-arrow text-gold-deep hover:text-ink">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, copy, action }: { title: string; copy?: string; action?: ReactNode }) {
  return (
    <div className="border border-hairline bg-white/70 px-6 py-12 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {copy && <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">{copy}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function SuccessNote({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className="border border-gold/50 bg-white px-5 py-4">
      <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-label text-gold-deep">
        <IconCheck className="h-4 w-4" /> {title}
      </p>
      {copy && <p className="mt-2 text-sm text-ink/75">{copy}</p>}
    </div>
  )
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center border border-hairline bg-white/70 px-2 py-0.5 font-sans text-[0.6rem] uppercase tracking-label text-ink/60',
        className,
      )}
      title="Illustrative demonstration content — replace before launch"
    >
      Demo content
    </span>
  )
}

interface PaginationProps {
  page: number
  pages: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, total, onChange }: PaginationProps) {
  if (pages <= 1) {
    return <p className="font-sans text-xs uppercase tracking-label text-warmgray">{total} result{total === 1 ? '' : 's'}</p>
  }
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pages || Math.abs(value - page) <= 1,
  )

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className="btn border-hairline px-4 py-2 text-ink disabled:opacity-40"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <IconArrow className="h-4 w-4 rotate-180" /> Prev
      </button>
      {numbers.map((value, index) => (
        <span key={value} className="flex items-center gap-2">
          {index > 0 && numbers[index - 1] !== value - 1 && <span className="text-warmgray">…</span>}
          <button
            type="button"
            aria-current={value === page ? 'page' : undefined}
            className={cx(
              'h-10 w-10 border font-sans text-xs',
              value === page ? 'border-ink bg-ink text-white' : 'border-hairline text-ink hover:border-ink',
            )}
            onClick={() => onChange(value)}
          >
            {value}
          </button>
        </span>
      ))}
      <button
        type="button"
        className="btn border-hairline px-4 py-2 text-ink disabled:opacity-40"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
      >
        Next <IconArrow className="h-4 w-4" />
      </button>
      <span className="ml-2 font-sans text-xs uppercase tracking-label text-warmgray">{total} results</span>
    </nav>
  )
}
