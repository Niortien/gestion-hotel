// components/chambres/RoomFilters.tsx
'use client'

import { useHotelStore } from '@/store/hotel-store'
import type { RoomType, RoomStatus } from '@/types/hotel'

const FLOORS = [1, 2, 3, 4]
const TYPES: { value: RoomType; labelFr: string; labelEn: string }[] = [
  { value: 'standard', labelFr: 'Standard', labelEn: 'Standard' },
  { value: 'deluxe',   labelFr: 'Deluxe',   labelEn: 'Deluxe' },
  { value: 'suite',    labelFr: 'Suite',     labelEn: 'Suite' },
  { value: 'prestige', labelFr: 'Prestige',  labelEn: 'Prestige' },
]
const STATUSES: { value: RoomStatus; labelFr: string; labelEn: string; color: string }[] = [
  { value: 'libre',     labelFr: 'Libre',     labelEn: 'Available',    color: '#1A6B4A' },
  { value: 'occupee',   labelFr: 'Occupée',   labelEn: 'Occupied',     color: '#8B1A2F' },
  { value: 'nettoyage', labelFr: 'Nettoyage', labelEn: 'Cleaning',     color: '#607856' },
  { value: 'travaux',   labelFr: 'Travaux',   labelEn: 'Maintenance',  color: '#C9A84C' },
]

interface Props {
  activeFloor: number | null
  activeType: RoomType | null
  activeStatus: RoomStatus | null
  onFloor: (f: number | null) => void
  onType: (t: RoomType | null) => void
  onStatus: (s: RoomStatus | null) => void
}

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 99,
        border: `1px solid ${active ? (color ?? '#B5924C') : '#EDE8DF'}`,
        background: active ? (color ? `${color}18` : '#B5924C18') : '#FFFFFF',
        color: active ? (color ?? '#B5924C') : '#5C6068',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

export function RoomFilters({ activeFloor, activeType, activeStatus, onFloor, onType, onStatus }: Props) {
  const locale = useHotelStore((s) => s.locale)

  return (
    <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Floor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#5C6068', minWidth: 50 }}>
          {locale === 'fr' ? 'Étage' : 'Floor'}
        </span>
        <Chip
          label={locale === 'fr' ? 'Tous' : 'All'}
          active={activeFloor === null}
          onClick={() => onFloor(null)}
        />
        {FLOORS.map((f) => (
          <Chip
            key={f}
            label={`${f}${locale === 'fr' ? 'er' : 'st'}`}
            active={activeFloor === f}
            onClick={() => onFloor(activeFloor === f ? null : f)}
          />
        ))}
      </div>

      {/* Type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#5C6068', minWidth: 50 }}>
          {locale === 'fr' ? 'Type' : 'Type'}
        </span>
        <Chip
          label={locale === 'fr' ? 'Tous' : 'All'}
          active={activeType === null}
          onClick={() => onType(null)}
        />
        {TYPES.map((t) => (
          <Chip
            key={t.value}
            label={locale === 'fr' ? t.labelFr : t.labelEn}
            active={activeType === t.value}
            onClick={() => onType(activeType === t.value ? null : t.value)}
          />
        ))}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#5C6068', minWidth: 50 }}>
          {locale === 'fr' ? 'Statut' : 'Status'}
        </span>
        <Chip
          label={locale === 'fr' ? 'Tous' : 'All'}
          active={activeStatus === null}
          onClick={() => onStatus(null)}
        />
        {STATUSES.map((s) => (
          <Chip
            key={s.value}
            label={locale === 'fr' ? s.labelFr : s.labelEn}
            active={activeStatus === s.value}
            color={s.color}
            onClick={() => onStatus(activeStatus === s.value ? null : s.value)}
          />
        ))}
      </div>
    </div>
  )
}
