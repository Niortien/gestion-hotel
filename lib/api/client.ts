// lib/api/client.ts
import { useAuthStore } from '@/store/auth-store'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()
  if (!refreshToken) { clearAuth(); return null }
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) { clearAuth(); return null }
    const json = await res.json()
    const data: { access_token: string } = json?.data ?? json
    setTokens(data.access_token, refreshToken)
    return data.access_token
  } catch {
    clearAuth()
    return null
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()

  const buildHeaders = (token: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  })

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(accessToken),
  })

  if (res.status === 401) {
    const newToken = await tryRefresh()
    if (newToken) {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: buildHeaders(newToken),
      })
    } else {
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new ApiError(401, 'Unauthorized')
    }
  }

  if (!res.ok) {
    let body: unknown
    try { body = await res.json() } catch { body = await res.text() }
    let apiMessage: unknown
    if (typeof body === 'object' && body !== null) {
      const b = body as Record<string, unknown>
      if (typeof b.message === 'string') {
        apiMessage = b.message
      } else if (typeof b.data === 'object' && b.data !== null) {
        apiMessage = (b.data as Record<string, unknown>).message
      }
    }
    const message = typeof apiMessage === 'string' && apiMessage
      ? apiMessage
      : `API ${res.status} — ${path}`
    throw new ApiError(res.status, message, body)
  }

  if (res.status === 204) return undefined as T
  const json = await res.json()
  return (json !== null && typeof json === 'object' && 'data' in json ? json.data : json) as T
}

/** Build a query string from a params object, skipping undefined/null values */
export function buildQuery(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return qs ? `?${qs}` : ''
}
