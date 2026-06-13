// store/hotel-store.ts
// UI state only — data now lives in TanStack Query (see lib/queries/)
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Alert } from '@/types/hotel'
import { ALERTS } from '@/lib/data/hotel'
import type { Locale } from '@/lib/i18n/config'

interface HotelStore {
  alerts: Alert[]
  locale: Locale

  // UI selection state
  selectedRoomId: string | null
  selectedGuestId: string | null
  selectedReservationId: string | null

  setLocale: (locale: Locale) => void
  setSelectedRoom: (id: string | null) => void
  setSelectedGuest: (id: string | null) => void
  setSelectedReservation: (id: string | null) => void
  resolveAlert: (alertId: string) => void
}

export const useHotelStore = create<HotelStore>()(
  immer((set) => ({
    alerts: ALERTS,
    locale: 'fr',
    selectedRoomId: null,
    selectedGuestId: null,
    selectedReservationId: null,

    setLocale: (locale) => set((s) => { s.locale = locale }),
    setSelectedRoom: (id) => set((s) => { s.selectedRoomId = id }),
    setSelectedGuest: (id) => set((s) => { s.selectedGuestId = id }),
    setSelectedReservation: (id) => set((s) => { s.selectedReservationId = id }),

    resolveAlert: (alertId) =>
      set((s) => {
        const alert = s.alerts.find((a) => a.id === alertId)
        if (alert) alert.resolved = true
      }),
  }))
)
