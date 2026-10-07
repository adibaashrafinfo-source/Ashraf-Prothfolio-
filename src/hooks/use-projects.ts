import * as React from 'react'

import { apiGet } from '@/lib/apiClient'
import { fallbackProjects } from '@/data/projects'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>(fallbackProjects)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiGet<Project[]>('/projects')
        if (!cancelled && data.length > 0) setProjects(data)
      } catch {
        // API unreachable/not configured — keep the fallback projects.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { projects, loading }
}
