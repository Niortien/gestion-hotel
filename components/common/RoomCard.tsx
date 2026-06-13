// components/common/RoomCard.tsx
'use client'

import { Users, Maximize2, Eye } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { formatAmount } from '@/lib/utils/format'
import type { Room } from '@/types/hotel'
import { useHotelStore } from '@/store/hotel-store'

const TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
  prestige: 'Prestige',
}

const STATUS_BG: Record<string, string> = {
  libre:     '#1A6B4A18',
  occupee:   '#8B1A2F18',
  nettoyage: '#60785618',
  travaux:   '#C9A84C20',
}

interface Props {
  room: Room
  onClick?: (room: Room) => void
  compact?: boolean
}

export function RoomCard({ room, onClick, compact = false }: Props) {
  const locale = useHotelStore((s) => s.locale)

  return (
    <div
      onClick={() => onClick?.(room)}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${STATUS_BG[room.status] ? room.status === 'libre' ? '#1A6B4A22' : room.status === 'occupee' ? '#8B1A2F22' : '#B5924C22' : '#EDE8DF'}`,
        borderRadius: 16,
        padding: compact ? '12px' : '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(61,31,15,0.12)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(61,31,15,0.06)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            room.status === 'libre'
              ? '#1A6B4A'
              : room.status === 'occupee'
              ? '#8B1A2F'
              : room.status === 'nettoyage'
              ? '#607856'
              : '#C9A84C',
          borderRadius: '16px 16px 0 0',
        }}
      />

      <div style={{ marginTop: compact ? 4 : 6 }}>
        {/* Room number */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: compact ? 18 : 22,
              fontWeight: 700,
              color: '#3D1F0F',
              letterSpacing: '-0.02em',
            }}
          >
            {room.number}
          </span>
          <StatusBadge status={room.status} locale={locale} size="sm" />
        </div>

        {/* Type */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
            fontSize: compact ? 13 : 15,
            fontStyle: 'italic',
            color: '#B5924C',
            marginTop: 2,
          }}
        >
          {TYPE_LABELS[room.type]}
        </div>

        {!compact && (
          <>
            {/* Separator */}
            <div className="brass-line" style={{ margin: '10px 0' }} />

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5C6068' }}>
                <Users size={12} strokeWidth={1.25} />
                {room.capacity}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5C6068' }}>
                <Maximize2 size={12} strokeWidth={1.25} />
                {room.surface}m²
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5C6068' }}>
                <Eye size={12} strokeWidth={1.25} />
                {room.view}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#B5924C',
                }}
              >
                {formatAmount(room.basePrice, room.currency)}
                <span style={{ fontSize: 10, color: '#5C6068', marginLeft: 2 }}>/nuit</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
