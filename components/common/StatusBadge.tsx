// components/common/StatusBadge.tsx
'use client'

import type { RoomStatus, ReservationStatus } from '@/types/hotel'

type Status = RoomStatus | ReservationStatus

const STATUS_CONFIG: Record<Status, { label: string; labelEn: string; color: string; bg: string }> = {
  libre:      { label: 'Libre',      labelEn: 'Available',   color: '#1A6B4A', bg: '#1A6B4A18' },
  occupee:    { label: 'Occupée',    labelEn: 'Occupied',    color: '#8B1A2F', bg: '#8B1A2F18' },
  nettoyage:  { label: 'Nettoyage',  labelEn: 'Cleaning',    color: '#607856', bg: '#60785618' },
  travaux:    { label: 'Travaux',    labelEn: 'Maintenance', color: '#C9A84C', bg: '#C9A84C20' },
  confirmee:  { label: 'Confirmée',  labelEn: 'Confirmed',   color: '#1A6B4A', bg: '#1A6B4A18' },
  checkin:    { label: 'Arrivée',    labelEn: 'Checked in',  color: '#1558A0', bg: '#1558A018' },
  en_attente: { label: 'En attente', labelEn: 'Pending',     color: '#C9A84C', bg: '#C9A84C20' },
  annulee:    { label: 'Annulée',    labelEn: 'Cancelled',   color: '#8B1A2F', bg: '#8B1A2F18' },
  terminee:   { label: 'Terminée',   labelEn: 'Completed',   color: '#5C6068', bg: '#5C606818' },
  no_show:    { label: 'Absent',     labelEn: 'No show',     color: '#3D1F0F', bg: '#3D1F0F12' },
}

interface Props {
  status: Status
  locale?: 'fr' | 'en'
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, locale = 'fr', size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, labelEn: status, color: '#5C6068', bg: '#5C606818' }
  const label = locale === 'fr' ? cfg.label : cfg.labelEn
  const px = size === 'sm' ? '8px' : '12px'
  const py = size === 'sm' ? '2px' : '4px'
  const fontSize = size === 'sm' ? '11px' : '12px'

  return (
    <span
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}30`,
        borderRadius: '99px',
        padding: `${py} ${px}`,
        fontSize,
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: cfg.color,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  )
}
