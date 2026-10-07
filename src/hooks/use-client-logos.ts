import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'
import type { ClientLogo } from '@/types'

export function useClientLogos() {
  const [logos, setLogos] = React.useState<ClientLogo[]>([])
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
          .from('client_logos')
          .select('*')
          .order('sort_order', { ascending: true })

        if (cancelled) return
        if (!error && data) setLogos(data as ClientLogo[])
      } catch {
        // Network/connection failure — render nothing rather than breaking the page.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { logos, loading }
}
