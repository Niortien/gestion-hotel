// lib/api/rooms.ts
import { apiFetch, buildQuery } from './client'
import { adaptRoom } from './adapters'
import type {
  ApiRoom, RoomListParams,
  CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto,
} from './types'
import type { Room, RoomStatus, RoomType, Currency } from '@/types/hotel'
import { toApiRoomType, toApiRoomStatus } from './adapters'

export async function getRooms(params: RoomListParams = {}): Promise<Room[]> {
  const data = await apiFetch<ApiRoom[]>(
    `/rooms${buildQuery(params as Record<string, unknown>)}`
  )
  return data.map(adaptRoom)
}

export async function getRoom(id: number): Promise<Room> {
  const r = await apiFetch<ApiRoom>(`/rooms/${id}`)
  return adaptRoom(r)
}

export async function createRoom(dto: {
  number: string; floor: number; type: RoomType; price: number; status?: RoomStatus; currency?: Currency
}): Promise<Room> {
  const body: CreateRoomDto = {
    number:   dto.number,
    floor:    dto.floor,
    type:     toApiRoomType(dto.type),
    price:    dto.price,
    ...(dto.currency ? { currency: dto.currency }         : {}),
    ...(dto.status   ? { status:   toApiRoomStatus(dto.status) } : {}),
  }
  const r = await apiFetch<ApiRoom>('/rooms', { method: 'POST', body: JSON.stringify(body) })
  return adaptRoom(r)
}

export async function updateRoom(id: number, dto: Partial<{
  number: string; floor: number; type: RoomType; price: number; status: RoomStatus; currency: Currency
}>): Promise<Room> {
  const body: UpdateRoomDto = {
    ...(dto.number   !== undefined ? { number:   dto.number }              : {}),
    ...(dto.floor    !== undefined ? { floor:    dto.floor  }              : {}),
    ...(dto.type     !== undefined ? { type:     toApiRoomType(dto.type)   } : {}),
    ...(dto.price    !== undefined ? { price:    dto.price  }              : {}),
    ...(dto.currency !== undefined ? { currency: dto.currency }            : {}),
    ...(dto.status   !== undefined ? { status:   toApiRoomStatus(dto.status) } : {}),
  }
  const r = await apiFetch<ApiRoom>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
  return adaptRoom(r)
}

export async function updateRoomStatus(id: number, status: RoomStatus): Promise<Room> {
  const body: UpdateRoomStatusDto = { status: toApiRoomStatus(status) }
  const r = await apiFetch<ApiRoom>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) })
  return adaptRoom(r)
}

export async function deleteRoom(id: number): Promise<void> {
  await apiFetch<void>(`/rooms/${id}`, { method: 'DELETE' })
}
