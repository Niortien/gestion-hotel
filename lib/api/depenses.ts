// lib/api/depenses.ts
import { apiFetch, buildQuery } from './client'
import type {
  ApiDepense,
  CreateDepenseDto,
  UpdateDepenseDto,
  DepenseListParams,
} from './types'

export async function getDepenses(params: DepenseListParams = {}): Promise<{ data: ApiDepense[]; total: number; page: number; limit: number; totalPages: number }> {
  return apiFetch(`/depenses${buildQuery({ limit: 100, ...params } as Record<string, unknown>)}`)
}

export async function getDepense(id: string): Promise<ApiDepense> {
  return apiFetch(`/depenses/${id}`)
}

export async function createDepense(dto: CreateDepenseDto): Promise<ApiDepense> {
  return apiFetch('/depenses', { method: 'POST', body: JSON.stringify(dto) })
}

export async function updateDepense(id: string, dto: UpdateDepenseDto): Promise<ApiDepense> {
  return apiFetch(`/depenses/${id}`, { method: 'PATCH', body: JSON.stringify(dto) })
}

export async function deleteDepense(id: string): Promise<void> {
  await apiFetch<void>(`/depenses/${id}`, { method: 'DELETE' })
}
