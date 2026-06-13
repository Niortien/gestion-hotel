// components/reservations/ReservationRow.tsx
'use client'

import { useHotelStore } from '@/store/hotel-store'
import { useGuests } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { StatusBadge } from '@/components/common/StatusBadge'
import { GuestTag } from '@/components/common/GuestTag'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'
import type { Reservation } from '@/types/hotel'
import { BedDouble, Calendar } from 'lucide-react'

interface Props {
  reservation: Reservation
  onSelect: (r: Reservation) => void
}

export function ReservationRow({ reservation, onSelect }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: guests = [] } = useGuests()
  const { data: rooms = [] } = useRooms()

  const guest = guests.find((g) => g.id === reservation.guestId)
  const room = rooms.find((r) => r.id === reservation.roomId)
  const nights = getNights(reservation.checkIn, reservation.checkOut)

  return (
    <div
      onClick={() => onSelect(reservation)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 1fr 80px 100px 80px',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: '#FFFFFF',
        border: '1px solid #EDE8DF',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#D4AF72'
        el.style.boxShadow = '0 2px 16px rgba(181,146,76,0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#EDE8DF'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Guest */}
      {guest ? (
        <GuestTag guest={guest} size="sm" />
      ) : (
        <span style={{ fontSize: 12, color: '#5C6068' }}>—</span>
      )}

      {/* Room */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <BedDouble size={12} strokeWidth={1.25} style={{ color: '#B5924C', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, fontWeight: 700, color: '#3D1F0F' }}>
            {room?.number ?? '—'}
          </div>
          <div style={{ fontSize: 10, color: '#5C6068', fontStyle: 'italic' }}>{room?.type}</div>
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={12} strokeWidth={1.25} style={{ color: '#5C6068', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#3D1F0F' }}>
            {formatDate(reservation.checkIn, locale)} → {formatDate(reservation.checkOut, locale)}
          </div>
          <div style={{ fontSize: 10, color: '#5C6068' }}>
            {nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'}
          </div>
        </div>
      </div>

      {/* Adults/children */}
      <div style={{ fontSize: 12, color: '#5C6068', textAlign: 'center' }}>
        {reservation.adults}A {reservation.children > 0 ? `${reservation.children}E` : ''}
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, fontWeight: 700, color: '#B5924C' }}>
          {formatAmount(reservation.totalAmount, reservation.currency)}
        </div>
        {reservation.paidAmount < reservation.totalAmount && (
          <div style={{ fontSize: 10, color: '#8B1A2F' }}>
            {locale === 'fr' ? 'solde: ' : 'due: '}
            {formatAmount(reservation.totalAmount - reservation.paidAmount, reservation.currency)}
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <StatusBadge status={reservation.status} locale={locale} size="sm" />
      </div>
    </div>
  )
}
