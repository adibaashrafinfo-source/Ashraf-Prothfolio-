import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'
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
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('social_links')
          .select('*')
          .order('sort_order', { ascending: true })

        if (cancelled) return
        if (!error && data && data.length > 0) {
          setLinks(data as SocialLink[])
        }
      } catch {
        // Network/connection failure — keep the default links.
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
