import * as React from 'react'

import { apiGet } from '@/lib/apiClient'
import { fallbackTestimonials } from '@/data/testimonials'
import type { Testimonial } from '@/types'

export function useTestimonials() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(fallbackTestimonials)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiGet<Testimonial[]>('/testimonials')
        if (!cancelled && data.length > 0) setTestimonials(data)
      } catch {
        // API unreachable/not configured — keep the fallback testimonials.
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
