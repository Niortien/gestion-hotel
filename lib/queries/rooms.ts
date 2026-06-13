// lib/queries/rooms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/rooms'
import type { RoomListParams } from '@/lib/api/types'
import type { RoomStatus, RoomType } from '@/types/hotel'

const KEY = 'rooms'

export function useRooms(params?: RoomListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => api.getRooms(params),
  })
}

export function useRoom(id: number) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn:  () => api.getRoom(id),
    enabled:  !!id,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createRoom,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: number } & Parameters<typeof api.updateRoom>[1]) =>
      api.updateRoom(id, dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useUpdateRoomStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RoomStatus }) =>
      api.updateRoomStatus(id, status),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteRoom(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
