import { useId, useState, type ReactNode } from 'react'

import { IconMinus, IconPlus } from '@/components/icons'
import { cx } from '@/components/ui/Primitives'

interface AccordionItemProps {
  question: string
  children: ReactNode
  defaultOpen?: boolean
}

/** Single accessible disclosure: real button, aria-expanded, animated panel. */
export function AccordionItem({ question, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className="border-b border-hairline">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-start justify-between gap-6 py-5 text-left"
        >
          <span className="font-serif text-lg leading-snug text-ink sm:text-xl">{question}</span>
          <span
            className={cx(
              'mt-1 flex h-7 w-7 shrink-0 items-center justify-center border transition-colors duration-base',
              open ? 'border-gold bg-gold text-white' : 'border-ink/25 text-ink',
            )}
          >
            {open ? <IconMinus className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className="overflow-hidden"
      >
        <p className="pb-6 pr-10 text-sm leading-relaxed text-ink/75">{children}</p>
      </div>
    </div>
  )
}
