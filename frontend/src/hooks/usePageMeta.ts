import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | null
  noindex?: boolean
}

const MANAGED = 'data-managed-meta'

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(MANAGED, 'true')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    element.setAttribute(MANAGED, 'true')
    document.head.appendChild(element)
  }
  element.href = href
}

/**
 * Per-page document metadata. Only values the application actually knows are
 * written — no invented ratings, prices or addresses are added to structured
 * data here.
 */
export function usePageMeta({ title, description, image, type = 'website', jsonLd, noindex }: PageMeta): void {
  useEffect(() => {
    const suffix = 'UrbanLedge'
    document.title = title.includes(suffix) ? title : `${title} — ${suffix}`
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description })
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: document.title })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: window.location.href })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    }
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    })
    upsertLink('canonical', window.location.origin + window.location.pathname)

    const scriptId = 'page-json-ld'
    document.getElementById(scriptId)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = scriptId
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, image, type, noindex, JSON.stringify(jsonLd ?? null)])
}
