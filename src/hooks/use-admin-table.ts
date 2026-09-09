import * as React from 'react'

import { supabase } from '@/lib/supabaseClient'

export function useAdminTable<T extends { id: string }>(
  table: string,
  orderColumn = 'created_at',
  ascending = false,
) {
  const [rows, setRows] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refetch = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderColumn, { ascending })

      if (error) {
        setError(error.message)
      } else {
        setRows((data ?? []) as T[])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [table, orderColumn, ascending])

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { rows, loading, error, refetch }
}
