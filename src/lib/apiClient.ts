/**
 * When the API lives on the same site as the page (ashrafarif.com/api), call it
 * on the page's own origin. Otherwise opening the site as http:// or www. while
 * the build points at https://ashrafarif.com/api turns login into a cross-origin
 * request that the browser blocks — the password looks "wrong" when it isn't.
 */
function resolveApiBase(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.replace(/\/+$/, '')
  if (typeof window === 'undefined') return trimmed
  try {
    const url = new URL(trimmed, window.location.origin)
    const site = (host: string) => host.replace(/^www\./, '')
    if (site(url.host) === site(window.location.host)) {
      return window.location.origin + url.pathname.replace(/\/+$/, '')
    }
  } catch {
    // Not a parseable URL — fall back to using it as-is.
  }
  return trimmed
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE_URL as string | undefined)

/** Admin and client-portal sessions are stored separately so one never overwrites the other. */
export type AuthScope = 'admin' | 'client'

const TOKEN_KEYS: Record<AuthScope, string> = {
  admin: 'portfolio_admin_token',
  client: 'portfolio_client_token',
}

export function isApiConfigured(): boolean {
  return Boolean(API_BASE)
}

export function getToken(scope: AuthScope = 'admin'): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS[scope])
  } catch {
    return null
  }
}

export function setToken(token: string, scope: AuthScope = 'admin'): void {
  try {
    localStorage.setItem(TOKEN_KEYS[scope], token)
  } catch {
    // Storage unavailable (private mode, etc.) — session just won't persist.
  }
}

export function clearToken(scope: AuthScope = 'admin'): void {
  try {
    localStorage.removeItem(TOKEN_KEYS[scope])
  } catch {
    // Nothing to clean up if storage was never reachable.
  }
}

/** True when a stored JWT exists and its `exp` is still in the future. */
export function hasValidToken(scope: AuthScope = 'admin'): boolean {
  const token = getToken(scope)
  if (!token) return false
  try {
    const json = atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    const exp = (JSON.parse(json) as { exp?: number }).exp
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: RequestInit = {},
  scope: AuthScope = 'admin',
): Promise<T> {
  if (!API_BASE) {
    throw new ApiError('The API is not configured. Set VITE_API_BASE_URL in your .env file.')
  }

  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken(scope)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Could not reach the server.')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data && typeof data.error === 'string') message = data.error
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    if (res.status === 401) clearToken(scope)
    throw new ApiError(message)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path, { method: 'GET' })

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' })

export async function apiUpload(file: File, folder: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const data = await request<{ url: string }>('/upload', { method: 'POST', body: form })
  return data.url
}

export const portalGet = <T>(path: string): Promise<T> =>
  request<T>(`/portal${path}`, { method: 'GET' }, 'client')

export const portalPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(`/portal${path}`, { method: 'POST', body: JSON.stringify(body) }, 'client')

export const portalPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(`/portal${path}`, { method: 'PUT', body: JSON.stringify(body) }, 'client')

function projectFileForm(projectId: string, file: File, note?: string): FormData {
  const form = new FormData()
  form.append('file', file)
  form.append('project_id', projectId)
  form.append('file_name', file.name)
  if (note) form.append('note', note)
  return form
}

/** Admin uploads a deliverable to a project's file vault. */
export const apiUploadProjectFile = <T>(projectId: string, file: File, note?: string): Promise<T> =>
  request<T>('/crm/files', { method: 'POST', body: projectFileForm(projectId, file, note) })

/** Client uploads their own asset to a project's file vault. */
export const portalUploadProjectFile = <T>(projectId: string, file: File, note?: string): Promise<T> =>
  request<T>('/portal/files', { method: 'POST', body: projectFileForm(projectId, file, note) }, 'client')

export function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Could not reach the server.'
}

/** Absolute URL of a file/page inside the API folder (e.g. the password reset page). */
export function apiUrl(path: string): string {
  return `${API_BASE ?? '/api'}${path}`
}
