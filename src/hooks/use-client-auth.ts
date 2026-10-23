import * as React from 'react'

import { clearToken, errorMessage, hasValidToken, isApiConfigured, portalPost, setToken } from '@/lib/apiClient'

export function useClientAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => hasValidToken('client'))

  const signIn = React.useCallback(async (email: string, password: string) => {
    if (!isApiConfigured()) return { error: 'The portal is not available right now.' }
    try {
      const data = await portalPost<{ token: string }>('/login', { email, password })
      setToken(data.token, 'client')
      setIsAuthenticated(true)
      return { error: null }
    } catch (err) {
      return { error: errorMessage(err) }
    }
  }, [])

  const signOut = React.useCallback(() => {
    clearToken('client')
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, signIn, signOut }
}
