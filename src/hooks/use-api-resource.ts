import * as React from 'react'

import { apiGet, errorMessage } from '@/lib/apiClient'

/** Fetches one admin API resource (object or list). Pass null to skip fetching. */
export function useApiResource<T>(path: string | null) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(path !== null)
  const [error, setError] = React.useState<string | null>(null)

  const refetch = React.useCallback(async () => {
    if (path === null) return
    setLoading(true)
    try {
      setData(await apiGet<T>(path))
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [path])

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { data, setData, loading, error, refetch }
}
