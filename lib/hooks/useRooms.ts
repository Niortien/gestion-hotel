// lib/hooks/useRooms.ts
'use client'

import { useMemo } from 'react'
import {
  useRooms as useRoomsQuery,
  useUpdateRoomStatus,
  useUpdateRoom as useUpdateRoomMutation,
} from '@/lib/queries/rooms'
import type { RoomType, RoomStatus, Room } from '@/types/hotel'

interface RoomFilters {
  floor?: number | null
  type?: RoomType | null
  status?: RoomStatus | null
  search?: string
}

export function useRooms(filters?: RoomFilters) {
  const { data: rooms = [], isLoading } = useRoomsQuery()
  const updateStatusMutation = useUpdateRoomStatus()
  const updateRoomMutation = useUpdateRoomMutation()

  const filtered = useMemo(() => {
    let result = [...rooms]
    if (filters?.floor != null) result = result.filter((r) => r.floor === filters.floor)
    if (filters?.type) result = result.filter((r) => r.type === filters.type)
    if (filters?.status) result = result.filter((r) => r.status === filters.status)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((r) =>
        r.number.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        String(r.floor).includes(q)
      )
    }
    return result
  }, [rooms, filters?.floor, filters?.type, filters?.status, filters?.search])

  const byFloor = useMemo(() => {
    const map = new Map<number, typeof rooms>()
    rooms.forEach((r) => {
      const arr = map.get(r.floor) ?? []
      arr.push(r)
      map.set(r.floor, arr)
    })
    return map
  }, [rooms])

  const floors = useMemo(() => Array.from(new Set(rooms.map((r) => r.floor))).sort(), [rooms])

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    updateStatusMutation.mutate({ id: Number(roomId), status })
  }

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...safeUpdates } = updates
    updateRoomMutation.mutate({ id: Number(roomId), ...safeUpdates } as Parameters<typeof updateRoomMutation.mutate>[0])
  }

  return { rooms: filtered, allRooms: rooms, byFloor, floors, updateRoomStatus, updateRoom, isLoading }
}
