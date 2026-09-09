import * as React from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabaseClient'

export function useAuth() {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
      })
      .catch(() => {
        // Network/connection failure — treat as signed out.
      })
      .finally(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = React.useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Could not reach the server.' }
    }
  }, [])

  const signOut = React.useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  return { session, loading, isAuthenticated: !!session, signIn, signOut }
}
