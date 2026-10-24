import { useCallback, useEffect, useRef } from 'react'

import { IconArrow, IconClose } from '@/components/icons'
import { Img } from '@/components/ui/Primitives'

export interface LightboxImage {
  image: string
  title: string
  caption?: string
  credit?: string
  href?: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

/** Accessible image viewer: focus is trapped, Escape closes, arrows navigate. */
export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const current = images[index]

  const step = useCallback(
    (direction: number) => {
      const next = (index + direction + images.length) % images.length
      onIndexChange(next)
    },
    [images.length, index, onIndexChange],
  )

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, step])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-evergreen/97 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={current.title || 'Gallery image'}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-ivory">
          <p className="font-serif text-2xl">{current.title}</p>
          {current.caption && <p className="mt-1 max-w-xl text-sm text-ivory/70">{current.caption}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-[0.65rem] uppercase tracking-label text-ivory/60">
            {index + 1} / {images.length}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center border border-ivory/40 text-ivory hover:bg-ivory/10"
            aria-label="Close image viewer"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-6">
        <Img
          src={current.image}
          alt={current.title || 'Project image'}
          className="max-h-full w-auto max-w-full object-contain"
          ratio="auto"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          className="btn border-ivory/40 text-ivory hover:bg-ivory/10"
        >
          <IconArrow className="h-4 w-4 rotate-180" /> Previous
        </button>
        <div className="text-right text-ivory/70">
          {current.credit && <p className="font-sans text-[0.65rem] uppercase tracking-label">{current.credit}</p>}
          {current.href && (
            <a href={current.href} className="link-arrow text-gold hover:text-ivory">
              View project <IconArrow className="h-4 w-4" />
            </a>
          )}
        </div>
        <button type="button" onClick={() => step(1)} className="btn border-ivory/40 text-ivory hover:bg-ivory/10">
          Next <IconArrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
