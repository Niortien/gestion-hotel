// lib/api/guests.ts
import { apiFetch, buildQuery } from './client'
import { adaptGuest, adaptGuestDetail } from './adapters'
import type { ApiGuest, ApiGuestDetail, GuestListParams, CreateGuestDto, UpdateGuestDto } from './types'
import type { Guest } from '@/types/hotel'

export async function getGuests(params: GuestListParams = {}): Promise<Guest[]> {
  const data = await apiFetch<ApiGuest[]>(
    `/guests${buildQuery({ limit: 100, ...params } as Record<string, unknown>)}`
  )
  return data.map(adaptGuest)
}

export async function getGuest(
  id: string,
  params?: { rPage?: number; rLimit?: number },
): Promise<Guest> {
  const qs = params ? buildQuery(params as Record<string, unknown>) : ''
  const g = await apiFetch<ApiGuestDetail>(`/guests/${id}${qs}`)
  return adaptGuestDetail(g)
}

export async function createGuest(dto: CreateGuestDto): Promise<Guest> {
  const g = await apiFetch<ApiGuest>('/guests', { method: 'POST', body: JSON.stringify(dto) })
  return adaptGuest(g)
}

export async function updateGuest(id: string, dto: UpdateGuestDto): Promise<Guest> {
  const g = await apiFetch<ApiGuest>(`/guests/${id}`, { method: 'PATCH', body: JSON.stringify(dto) })
  return adaptGuest(g)
}

export async function deleteGuest(id: string): Promise<void> {
  await apiFetch<void>(`/guests/${id}`, { method: 'DELETE' })
}
