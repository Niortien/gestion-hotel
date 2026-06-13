// lib/queries/reservations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/reservations'
import type { ReservationListParams } from '@/lib/api/types'
import type { ReservationStatus } from '@/types/hotel'

const KEY = 'reservations'

export function useReservations(params?: ReservationListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => api.getReservations(params),
  })
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn:  () => api.getReservation(id),
    enabled:  !!id,
  })
}

export function useCreateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createReservation,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['rooms'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Parameters<typeof api.updateReservation>[1]) =>
      api.updateReservation(id, dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      api.updateReservationStatus(id, status),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['rooms'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteReservation(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
