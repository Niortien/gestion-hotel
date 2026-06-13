// lib/api/services.ts
import { apiFetch, buildQuery } from './client'
import { adaptService } from './adapters'
import type { ApiServiceItem, ServiceListParams, CreateServiceDto, UpdateServiceDto } from './types'
import type { Service } from '@/types/hotel'

export async function getServices(params: ServiceListParams = {}): Promise<Service[]> {
  const data = await apiFetch<ApiServiceItem[]>(
    `/services${buildQuery({ limit: 100, ...params } as Record<string, unknown>)}`
  )
  return data.map(adaptService)
}

export async function createService(dto: CreateServiceDto): Promise<Service> {
  const s = await apiFetch<ApiServiceItem>('/services', { method: 'POST', body: JSON.stringify(dto) })
  return adaptService(s)
}

export async function updateService(id: string, dto: UpdateServiceDto): Promise<Service> {
  const s = await apiFetch<ApiServiceItem>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(dto) })
  return adaptService(s)
}

export async function deleteService(id: string): Promise<void> {
  await apiFetch<void>(`/services/${id}`, { method: 'DELETE' })
}
