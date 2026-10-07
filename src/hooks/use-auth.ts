import * as React from 'react'

import { ApiError, apiPost, clearToken, getToken, isApiConfigured, setToken } from '@/lib/apiClient'

interface TokenPayload {
  exp: number
}

function decodeTokenExpiry(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1]
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as TokenPayload
    return payload.exp ?? null
  } catch {
    return null
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false
  const exp = decodeTokenExpiry(token)
  if (exp === null) return false
  return exp * 1000 > Date.now()
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => isTokenValid(getToken()))

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
