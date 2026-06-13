// lib/queries/guests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/guests'
import type { GuestListParams, CreateGuestDto, UpdateGuestDto } from '@/lib/api/types'

const KEY = 'guests'

export function useGuests(params?: GuestListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => api.getGuests(params),
  })
}

export function useGuest(id: string, params?: { rPage?: number; rLimit?: number }) {
  return useQuery({
    queryKey: [KEY, id, params],
    queryFn:  () => api.getGuest(id, params),
    enabled:  !!id,
  })
}

export function useCreateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateGuestDto) => api.createGuest(dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useUpdateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & UpdateGuestDto) =>
      api.updateGuest(id, dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useDeleteGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteGuest(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
