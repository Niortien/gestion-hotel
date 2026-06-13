// components/clients/GuestList.tsx
'use client'

import { useState } from 'react'
import { useHotelStore } from '@/store/hotel-store'
import { GuestProfile } from './GuestProfile'
import type { Guest } from '@/types/hotel'

interface Props { guests: Guest[] }

export function GuestList({ guests }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (guests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#5C6068', fontSize: 14 }}>
        {locale === 'fr' ? 'Aucun client trouvé' : 'No guests found'}
      </div>
    )
  }

  return (
    <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {guests.map((guest) => (
        <GuestProfile
          key={guest.id}
          guest={guest}
          isExpanded={expandedId === guest.id}
          onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
        />
      ))}
    </div>
  )
}
