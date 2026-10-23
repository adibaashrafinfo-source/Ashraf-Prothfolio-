import * as React from 'react'

import { ApiError, apiPost, clearToken, hasValidToken, isApiConfigured, setToken } from '@/lib/apiClient'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => hasValidToken('admin'))

  const signIn = React.useCallback(async (email: string, password: string) => {
    if (!isApiConfigured()) return { error: 'The API is not configured.' }
    try {
      const data = await apiPost<{ token: string }>('/auth/login', { email, password })
      setToken(data.token)
      setIsAuthenticated(true)
      return { error: null }
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Could not reach the server.' }
    }
  }, [])

  const signOut = React.useCallback(async () => {
    clearToken()
    setIsAuthenticated(false)
  }, [])

  // Session check is a synchronous localStorage read, so there's never an
  // actual loading window — kept only so RequireAuth's shape stays stable.
  return { loading: false, isAuthenticated, signIn, signOut }
}
