import * as React from 'react'

import { apiGet } from '@/lib/apiClient'
import type { ClientLogo } from '@/types'

export function useClientLogos() {
  const [logos, setLogos] = React.useState<ClientLogo[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiGet<ClientLogo[]>('/client-logos')
        if (!cancelled) setLogos(data)
      } catch {
        // API unreachable/not configured — render nothing rather than breaking the page.
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
