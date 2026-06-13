// components/clients/StayHistory.tsx
'use client'

import { useHotelStore } from '@/store/hotel-store'
import { useGuest } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'
import type { Guest } from '@/types/hotel'
import { CalendarDays, BedDouble, DollarSign } from 'lucide-react'

interface Props { guest: Guest }

export function StayHistory({ guest }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: guestDetail, isLoading } = useGuest(guest.id)
  const { data: rooms = [] } = useRooms()

  const stays = (guestDetail?.reservations ?? [])
    .slice()
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())

  return (
    <div>
      <h4
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#3D1F0F',
          marginBottom: 12,
        }}
      >
        {locale === 'fr' ? 'Historique des séjours' : 'Stay history'}
        <span
          style={{
            marginLeft: 8,
            background: '#B5924C18',
            color: '#B5924C',
            borderRadius: 99,
            padding: '1px 8px',
            fontSize: 11,
            fontFamily: 'var(--font-dm-mono), monospace',
          }}
        >
          {isLoading ? '…' : stays.length}
        </span>
      </h4>

      {isLoading ? (
        <div style={{ fontSize: 13, color: '#5C6068', textAlign: 'center', padding: '16px 0' }}>
          {locale === 'fr' ? 'Chargement…' : 'Loading…'}
        </div>
      ) : stays.length === 0 ? (
        <div style={{ fontSize: 13, color: '#5C6068', textAlign: 'center', padding: '16px 0' }}>
          {locale === 'fr' ? 'Aucun séjour' : 'No stays'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stays.map((res) => {
            const room = rooms.find((r) => r.id === res.roomId)
            const nights = getNights(res.checkIn, res.checkOut)
            return (
              <div
                key={res.id}
                style={{
                  background: '#FAF7F2',
                  border: '1px solid #EDE8DF',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BedDouble size={13} strokeWidth={1.25} style={{ color: '#B5924C' }} />
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#3D1F0F',
                      }}
                    >
                      {room?.number ?? '—'}
                    </span>
                    <span style={{ fontSize: 11, color: '#5C6068', fontStyle: 'italic' }}>
                      {room?.type}
                    </span>
                  </div>
                  <StatusBadge status={res.status} locale={locale} size="sm" />
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5C6068' }}>
                    <CalendarDays size={11} strokeWidth={1.25} />
                    {formatDate(res.checkIn, locale)} → {formatDate(res.checkOut, locale)}
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>({nights}n)</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#B5924C', fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 600 }}>
                    <DollarSign size={11} strokeWidth={1.25} />
                    {formatAmount(res.totalAmount, res.currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
