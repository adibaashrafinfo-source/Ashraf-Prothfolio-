import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'
import { fallbackProjects } from '@/data/projects'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>(fallbackProjects)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (!error && data && data.length > 0) {
        setProjects(data as Project[])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { projects, loading }
}
