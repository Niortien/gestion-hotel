// components/dashboard/OccupancyTimeline.tsx
'use client'

import { useRef, useEffect } from 'react'
import { ScrollTrigger, gsap, initGSAP } from '@/lib/animations/gsap.config'
import { formatTime, formatAmount } from '@/lib/utils/format'
import { useHotelStore } from '@/store/hotel-store'
import { useDashboardEvents } from '@/lib/queries/dashboard'
import {
  LogIn, LogOut, Coffee, CreditCard, AlertTriangle, StickyNote
} from 'lucide-react'

const EVENT_ICONS: Record<string, React.ElementType> = {
  checkin:  LogIn,
  checkout: LogOut,
  service:  Coffee,
  paiement: CreditCard,
  alerte:   AlertTriangle,
  note:     StickyNote,
}

const EVENT_COLORS: Record<string, string> = {
  checkin:  '#1A6B4A',
  checkout: '#8B1A2F',
  service:  '#B5924C',
  paiement: '#607856',
  alerte:   '#C9A84C',
  note:     '#5C6068',
}

export function OccupancyTimeline() {
  const locale = useHotelStore((s) => s.locale)
  const today = new Date().toISOString().split('T')[0]
  const { data: events = [] } = useDashboardEvents(today)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initGSAP()
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll('[data-timeline-item]')
    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 90%',
        onEnter: () => {
          gsap.fromTo(item, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
        },
        once: true,
      })
    })
    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()) }
  }, [events])

  return (
    <div ref={containerRef} data-animate style={{ position: 'relative', paddingLeft: 32 }}>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: 11,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'linear-gradient(180deg, #B5924C88, #B5924C22)',
        }}
      />

      {events.map((event) => {
        const Icon = EVENT_ICONS[event.type] ?? StickyNote
        const color = EVENT_COLORS[event.type] ?? '#5C6068'
        const title = locale === 'fr' ? event.title : event.titleEn

        return (
          <div
            key={event.id}
            data-timeline-item
            style={{
              position: 'relative',
              marginBottom: 20,
              opacity: 0,
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: 'absolute',
                left: -32 + 5,
                top: 6,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: color,
                border: '2px solid #FAF7F2',
                boxShadow: `0 0 0 2px ${color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />

            {/* Content */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #EDE8DF',
                borderRadius: 12,
                padding: '10px 14px',
                boxShadow: '0 2px 8px rgba(61,31,15,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={13} strokeWidth={1.25} style={{ color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>{title}</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: 11,
                    color: '#5C6068',
                    flexShrink: 0,
                  }}
                >
                  {formatTime(event.time, locale)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#5C6068', marginTop: 3, lineHeight: 1.4 }}>
                {event.description}
              </p>
              {event.amount != null && (
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: 12,
                    color: '#B5924C',
                    fontWeight: 600,
                    marginTop: 4,
                    display: 'inline-block',
                  }}
                >
                  +{formatAmount(event.amount, 'FCFA')}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
