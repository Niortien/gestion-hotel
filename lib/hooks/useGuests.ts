// lib/hooks/useGuests.ts
'use client'

import { useMemo } from 'react'
import { useGuests as useGuestsQuery, useCreateGuest } from '@/lib/queries/guests'
import type { CreateGuestDto } from '@/lib/api/types'

export function useGuests(search?: string) {
  const { data: guests = [], isLoading } = useGuestsQuery()
  const createMutation = useCreateGuest()

  const filtered = useMemo(() => {
    if (!search) return guests
    const q = search.toLowerCase()
    return guests.filter(
      (g) =>
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q)
    )
  }, [guests, search])

  const addGuest = (dto: CreateGuestDto) => createMutation.mutateAsync(dto)

  return {
    guests: filtered,
    allGuests: guests,
    addGuest,
    isLoading,
  }
}
