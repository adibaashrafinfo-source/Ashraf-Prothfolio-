import * as React from 'react'

import { apiGet } from '@/lib/apiClient'
import { defaultSiteSettings } from '@/data/site'
import type { SiteSettings } from '@/types'

export function useSiteSettings() {
  const [settings, setSettings] =
    React.useState<Omit<SiteSettings, 'id' | 'updated_at'>>(defaultSiteSettings)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiGet<SiteSettings>('/site-settings')
        if (!cancelled) setSettings({ ...defaultSiteSettings, ...data })
      } catch {
        // API unreachable/not configured — keep the default settings.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}
