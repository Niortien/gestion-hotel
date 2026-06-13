// components/common/GuestTag.tsx
'use client'

import { Crown } from 'lucide-react'
import { getInitials } from '@/lib/utils/format'
import type { Guest } from '@/types/hotel'

interface Props {
  guest: Guest
  size?: 'sm' | 'md'
  showVip?: boolean
}

export function GuestTag({ guest, size = 'md', showVip = true }: Props) {
  const initials = getInitials(guest.firstName, guest.lastName)
  const avatarSize = size === 'sm' ? 28 : 36

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          background: guest.vip
            ? 'linear-gradient(135deg, #B5924C, #D4AF72)'
            : 'linear-gradient(135deg, #EDE8DF, #D4C9B8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: guest.vip ? '#FAF7F2' : '#5C6068',
          fontSize: size === 'sm' ? 11 : 13,
          fontWeight: 600,
          letterSpacing: '0.05em',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(61,31,15,0.12)',
          fontFamily: 'var(--font-dm-mono), monospace',
        }}
      >
        {initials}
      </div>
      <div>
        <div
          style={{
            fontSize: size === 'sm' ? 12 : 14,
            fontWeight: 500,
            color: '#3D1F0F',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {guest.firstName} {guest.lastName}
          {showVip && guest.vip && (
            <Crown size={12} color="#B5924C" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          )}
        </div>
        {size === 'md' && (
          <div style={{ fontSize: 11, color: '#5C6068' }}>{guest.email}</div>
        )}
      </div>
    </div>
  )
}
