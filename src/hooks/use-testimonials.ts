import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'
import { fallbackTestimonials } from '@/data/testimonials'
import type { Testimonial } from '@/types'

export function useTestimonials() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(fallbackTestimonials)
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
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })

        if (cancelled) return
        if (!error && data && data.length > 0) {
          setTestimonials(data as Testimonial[])
        }
      } catch {
        // Network/connection failure — keep the fallback testimonials.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { testimonials, loading }
}
