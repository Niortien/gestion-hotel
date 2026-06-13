// lib/hooks/useReservations.ts
'use client'

import { useMemo } from 'react'
import {
  useReservations as useReservationsQuery,
  useCreateReservation,
  useUpdateReservationStatus,
} from '@/lib/queries/reservations'
import { useGuests as useGuestsQuery } from '@/lib/queries/guests'
import { useRooms as useRoomsQuery } from '@/lib/queries/rooms'
import type { ReservationStatus } from '@/types/hotel'

export function useReservations(search?: string, statusFilter?: ReservationStatus | null) {
  const { data: reservations = [], isLoading } = useReservationsQuery()
  const { data: guests = [] } = useGuestsQuery()
  const { data: rooms = [] } = useRoomsQuery()
  const createMutation = useCreateReservation()
  const updateStatusMutation = useUpdateReservationStatus()

  const filtered = useMemo(() => {
    let result = [...reservations]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => {
        const guest = guests.find((g) => g.id === r.guestId)
        const room = rooms.find((rm) => rm.id === r.roomId)
        return (
          guest?.firstName.toLowerCase().includes(q) ||
          guest?.lastName.toLowerCase().includes(q) ||
          room?.number.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.checkIn.includes(q) ||
          r.checkOut.includes(q) ||
          r.id.toLowerCase().includes(q)
        )
      })
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reservations, search, statusFilter, guests, rooms])

  const getReservation = (id: string) => reservations.find((r) => r.id === id)
  const getGuest = (guestId: string) => guests.find((g) => g.id === guestId)
  const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId)

  const addReservation = createMutation.mutateAsync
  const updateReservationStatus = (resId: string, status: ReservationStatus) => {
    updateStatusMutation.mutate({ id: resId, status })
  }

  return {
    reservations: filtered,
    allReservations: reservations,
    addReservation,
    updateReservationStatus,
    getReservation,
    getGuest,
    getRoom,
    isLoading,
  }
}
