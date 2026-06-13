// components/dashboard/LiveFeed.tsx
'use client'

import { formatTime } from '@/lib/utils/format'
import { useHotelStore } from '@/store/hotel-store'
import { useDashboardEvents } from '@/lib/queries/dashboard'
import { LogIn, LogOut, Coffee, CreditCard, AlertTriangle, StickyNote } from 'lucide-react'

const EVENT_ICONS: Record<string, React.ElementType> = {
  checkin: LogIn, checkout: LogOut, service: Coffee,
  paiement: CreditCard, alerte: AlertTriangle, note: StickyNote,
}
const EVENT_COLORS: Record<string, string> = {
  checkin: '#1A6B4A', checkout: '#8B1A2F', service: '#B5924C',
  paiement: '#607856', alerte: '#C9A84C', note: '#5C6068',
}

export function LiveFeed() {
  const locale = useHotelStore((s) => s.locale)
  const today = new Date().toISOString().split('T')[0]
  const { data: events = [] } = useDashboardEvents(today)
  const todayEvents = events.slice(0, 6)

  return (
    <div data-animate>
      <h3
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 18,
          fontWeight: 600,
          color: '#3D1F0F',
          marginBottom: 12,
        }}
      >
        {locale === 'fr' ? 'Événements en direct' : 'Live events'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {todayEvents.map((event) => {
          const Icon = EVENT_ICONS[event.type] ?? StickyNote
          const color = EVENT_COLORS[event.type] ?? '#5C6068'
          const title = locale === 'fr' ? event.title : event.titleEn

          return (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #EDE8DF',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={13} strokeWidth={1.25} style={{ color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#3D1F0F', lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#5C6068', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.description}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: '#5C6068', flexShrink: 0 }}>
                {formatTime(event.time, locale)}
              </span>
            </div>
          )
        })}

        {todayEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#5C6068', fontSize: 13 }}>
            {locale === 'fr' ? 'Aucun événement aujourd\'hui' : 'No events today'}
          </div>
        )}
      </div>
    </div>
  )
}

