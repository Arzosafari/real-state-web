/** Understated line icons drawn as SVG so no icon font or image is needed. */

interface IconProps {
  className?: string
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export function IconBuilding({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V7l7-3v16" />
      <path d="M11 20V10l6 2.5V20" />
      <path d="M3 20h18" />
      <path d="M7 9v.01M7 13v.01M14 14v.01M14 17v.01" />
    </svg>
  )
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19c9 0 14-5 14-14-9 0-14 5-14 14Z" />
      <path d="M5 19c2-5 5-8 10-10" />
    </svg>
  )
}

export function IconCommunity({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M13.5 15.4A5 5 0 0 1 21 20" />
    </svg>
  )
}

export function IconLayers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  )
}

export function IconChart({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  )
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconMinus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </svg>
  )
}

export function IconHeart({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6C19 15.7 12 20 12 20Z" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function IconAlert({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </svg>
  )
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  )
}

export function IconList({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

const SOCIAL_PATHS: Record<string, string> = {
  linkedin: 'M6 9v9M6 6.5v.01M11 18V9M11 12.5c0-2 1.3-3.5 3.3-3.5 1.9 0 2.7 1.3 2.7 3.4V18',
  instagram: 'M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm5 5.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5ZM17 7.5v.01',
  youtube: 'M3 12c0-2 .3-3.4.5-4 .2-.5.6-.8 1.1-.9C6.2 6.8 9 6.7 12 6.7s5.8.1 7.4.4c.5.1.9.4 1.1.9.2.6.5 2 .5 4s-.3 3.4-.5 4c-.2.5-.6.8-1.1.9-1.6.3-4.4.4-7.4.4s-5.8-.1-7.4-.4c-.5-.1-.9-.4-1.1-.9-.2-.6-.5-2-.5-4Zm7 2.6 4-2.6-4-2.6Z',
}

export function IconSocial({ name, className }: IconProps & { name: string }) {
  return (
    <svg {...base} className={className}>
      <path d={SOCIAL_PATHS[name] ?? SOCIAL_PATHS.linkedin} />
    </svg>
  )
}

/** Minimal architectural mark: a stepped elevation inside a frame. */
export function UrbanLedgeMark({ className }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 32 32" className={className} strokeWidth={1.1}>
      <path d="M4 27V12l8-4v19" />
      <path d="M12 27V15l8 3.5V27" />
      <path d="M20 27V18l8-3v12" />
      <path d="M2 27h28" />
    </svg>
  )
}

export const SERVICE_ICONS = {
  building: IconBuilding,
  layers: IconLayers,
  leaf: IconLeaf,
  chart: IconChart,
  community: IconCommunity,
} as const

export type ServiceIconName = keyof typeof SERVICE_ICONS

export function ServiceIcon({ name, className }: IconProps & { name: string }) {
  const Component = SERVICE_ICONS[name as ServiceIconName] ?? IconBuilding
  return <Component className={className} />
}
