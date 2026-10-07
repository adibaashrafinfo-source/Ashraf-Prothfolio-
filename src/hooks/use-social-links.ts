import * as React from 'react'

import { apiGet } from '@/lib/apiClient'
import { defaultSocialLinks } from '@/data/site'
import type { SocialLink } from '@/types'

type FallbackLink = Pick<SocialLink, 'name' | 'icon' | 'href' | 'sort_order'>

export function useSocialLinks() {
  const [links, setLinks] = React.useState<Array<FallbackLink & { id: string }>>(
    defaultSocialLinks.map((link, i) => ({ ...link, id: `fallback-${i}` })),
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiGet<SocialLink[]>('/social-links')
        if (!cancelled && data.length > 0) setLinks(data)
      } catch {
        // API unreachable/not configured — keep the default links.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { links, loading }
}
