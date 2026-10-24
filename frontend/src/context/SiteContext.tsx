import { createContext, useContext, type ReactNode } from 'react'

import { useApi } from '@/hooks/useApi'
import type { Meta, SiteSettings } from '@/lib/types'

interface SiteValue {
  settings: SiteSettings | null
  meta: Meta | null
  loading: boolean
  error: string | null
  reload: () => void
}

const SiteContext = createContext<SiteValue>({
  settings: null,
  meta: null,
  loading: true,
  error: null,
  reload: () => {},
})

/** Site settings and reference lists, loaded once for the whole app. */
export function SiteProvider({ children }: { children: ReactNode }) {
  const settings = useApi<SiteSettings>('/settings')
  const meta = useApi<Meta>('/meta')

  const value: SiteValue = {
    settings: settings.data,
    meta: meta.data,
    loading: settings.loading || meta.loading,
    error: settings.error ?? meta.error,
    reload: () => {
      settings.reload()
      meta.reload()
    },
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite(): SiteValue {
  return useContext(SiteContext)
}

export function useInquiryTypes(): string[] {
  return useSite().meta?.inquiry_types ?? []
}
