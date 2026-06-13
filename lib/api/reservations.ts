// lib/api/reservations.ts
import { apiFetch, buildQuery } from './client'
import { adaptReservation, toApiResStatus } from './adapters'
import type {
  ApiReservation, ReservationListParams,
  CreateReservationDto, UpdateReservationDto, UpdateReservationStatusDto,
} from './types'
import type { Reservation, ReservationStatus } from '@/types/hotel'

export async function getReservations(params: ReservationListParams = {}): Promise<Reservation[]> {
  const data = await apiFetch<ApiReservation[]>(
    `/reservations${buildQuery({ limit: 100, ...params } as Record<string, unknown>)}`
  )
  return data.map(adaptReservation)
}

export async function getReservation(id: string): Promise<Reservation> {
  const r = await apiFetch<ApiReservation>(`/reservations/${id}`)
  return adaptReservation(r)
}

export async function createReservation(dto: {
  guestId: string
  roomId: string
  checkIn: string
  checkOut?: string
  stayType?: 'NUIT' | 'PASSAGE'
  durationHours?: number
  totalAmount?: number
  currency?: string
  services?: { serviceId: string; quantity?: number }[]
}): Promise<Reservation> {
  const body: CreateReservationDto = {
    guestId:      dto.guestId,
    roomId:       Number(dto.roomId),
    checkIn:      dto.checkIn,
    ...(dto.checkOut      !== undefined ? { checkOut:      dto.checkOut }                                       : {}),
    ...(dto.stayType      !== undefined ? { stayType:      dto.stayType as import('./types').ApiStayType }      : {}),
    ...(dto.durationHours !== undefined ? { durationHours: dto.durationHours }                                 : {}),
    totalAmount:  dto.totalAmount,
    ...(dto.currency ? { currency: dto.currency as import('./types').ApiCurrency } : {}),
    services:     dto.services,
  }
  const r = await apiFetch<ApiReservation>('/reservations', { method: 'POST', body: JSON.stringify(body) })
  return adaptReservation(r)
}

export async function updateReservation(id: string, dto: Partial<{
  guestId: string; roomId: string; checkIn: string; checkOut: string; totalAmount: number
}>): Promise<Reservation> {
  const body: UpdateReservationDto = {
    ...(dto.guestId      !== undefined ? { guestId:     dto.guestId }      : {}),
    ...(dto.roomId       !== undefined ? { roomId:      Number(dto.roomId) } : {}),
    ...(dto.checkIn      !== undefined ? { checkIn:     dto.checkIn }      : {}),
    ...(dto.checkOut     !== undefined ? { checkOut:    dto.checkOut }     : {}),
    ...(dto.totalAmount  !== undefined ? { totalAmount: dto.totalAmount }  : {}),
  }
  const r = await apiFetch<ApiReservation>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
  return adaptReservation(r)
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
  const body: UpdateReservationStatusDto = { status: toApiResStatus(status) }
  const r = await apiFetch<ApiReservation>(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) })
  return adaptReservation(r)
}

export async function deleteReservation(id: string): Promise<void> {
  await apiFetch<void>(`/reservations/${id}`, { method: 'DELETE' })
}
