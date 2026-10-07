import * as React from 'react'

import { apiGet } from '@/lib/apiClient'

/** Fetches a list from an admin API path, e.g. '/projects' or '/leads'. */
export function useAdminTable<T>(path: string) {
  const [rows, setRows] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refetch = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<T[]>(path)
      setRows(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [path])

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { rows, loading, error, refetch }
}
