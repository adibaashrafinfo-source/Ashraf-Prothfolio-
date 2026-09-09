import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'
import { defaultSiteSettings } from '@/data/site'
import type { SiteSettings } from '@/types'

export function useSiteSettings() {
  const [settings, setSettings] =
    React.useState<Omit<SiteSettings, 'id' | 'updated_at'>>(defaultSiteSettings)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()

        if (cancelled) return
        if (!error && data) {
          setSettings({ ...defaultSiteSettings, ...data })
        }
      } catch {
        // Network/connection failure — keep the default settings.
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
