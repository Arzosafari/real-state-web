/** Presentation helpers. */

export function formatPrice(
  price: number | null,
  currency = 'USD',
  period?: string | null,
): string {
  if (price === null || price === undefined) return 'Price on request'
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
  return period ? `${formatted} ${period}` : formatted
}

export function formatArea(area: number | null): string {
  if (!area) return '—'
  return `${new Intl.NumberFormat('en-US').format(Math.round(area))} m²`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function humanStatus(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function bedroomsLabel(bedrooms: number | null): string | null {
  if (bedrooms === null || bedrooms === undefined) return null
  return `${bedrooms} bed${bedrooms === 1 ? '' : 's'}`
}

export function bathroomsLabel(bathrooms: number | null): string | null {
  if (bathrooms === null || bathrooms === undefined) return null
  return `${bathrooms} bath${bathrooms === 1 ? '' : 's'}`
}

/** Turn plain text from the API into paragraphs, honouring `##` subheads. */
export function splitParagraphs(content: string): { type: 'h2' | 'p'; text: string }[] {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith('## ')
        ? { type: 'h2' as const, text: block.replace(/^##\s+/, '') }
        : { type: 'p' as const, text: block.replace(/\n/g, ' ') },
    )
}

export function priceRangeLabel(min: number | null, max: number | null, currency = 'USD'): string {
  if (min === null && max === null) return 'Price on request'
  if (min !== null && max !== null) {
    return `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`
  }
  return formatPrice(min ?? max, currency)
}
