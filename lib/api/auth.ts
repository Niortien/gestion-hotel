// lib/api/auth.ts
import { apiFetch, API_BASE } from './client'
import type { LoginResponse } from './types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.data?.message ?? body?.message ?? 'Email ou mot de passe invalide')
  }
  const json = await res.json()
  return (json?.data ?? json) as LoginResponse
}

export async function refreshToken(refreshTkn: string): Promise<{ access_token: string }> {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshTkn }),
  })
}
