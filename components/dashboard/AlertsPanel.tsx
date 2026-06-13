// components/dashboard/AlertsPanel.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { useHotelStore } from '@/store/hotel-store'
import { useDashboardAlerts } from '@/lib/queries/dashboard'
import { Check, LogIn, LogOut, Sparkles, Wrench, CreditCard, AlertCircle } from 'lucide-react'
import type { AlertType } from '@/types/hotel'

const ALERT_ICONS: Record<AlertType, React.ElementType> = {
  checkin:     LogIn,
  checkout:    LogOut,
  nettoyage:   Sparkles,
  maintenance: Wrench,
  paiement:    CreditCard,
  vip:         AlertCircle,
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    '#5C6068',
  medium: '#C9A84C',
  high:   '#B5924C',
  urgent: '#8B1A2F',
}

export function AlertsPanel() {
  const locale = useHotelStore((s) => s.locale)
  const { data: apiAlerts = [] } = useDashboardAlerts()
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  const pending = apiAlerts.filter((a) => !a.resolved && !resolvedIds.has(a.id))

  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-alert-item]')
    gsap.fromTo(
      items,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
    )
  }, [apiAlerts])

  return (
    <div data-animate>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#3D1F0F',
          }}
        >
          {locale === 'fr' ? 'Alertes' : 'Alerts'}
        </h3>
        <span
          style={{
            background: '#8B1A2F18',
            color: '#8B1A2F',
            borderRadius: 99,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {pending.length}
        </span>
      </div>

      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pending.map((alert) => {
          const Icon = ALERT_ICONS[alert.type as AlertType] ?? AlertCircle
          const color = PRIORITY_COLORS[alert.priority] ?? '#5C6068'
          const message = locale === 'fr' ? alert.message : alert.messageEn

          return (
            <div
              key={alert.id}
              data-alert-item
              data-alert-id={alert.id}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${color}22`,
                borderLeft: `3px solid ${color}`,
                borderRadius: '0 10px 10px 0',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                opacity: 0,
              }}
            >
              <Icon size={14} strokeWidth={1.25} style={{ color, flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#3D1F0F', flex: 1, lineHeight: 1.5 }}>{message}</p>
              <button
                onClick={() => {
                  const el = document.querySelector(`[data-alert-id="${alert.id}"]`)
                  if (el) {
                    gsap.to(el, {
                      opacity: 0,
                      x: 20,
                      duration: 0.25,
                      onComplete: () => setResolvedIds((prev) => new Set([...prev, alert.id])),
                    })
                  } else {
                    setResolvedIds((prev) => new Set([...prev, alert.id]))
                  }
                }}
                style={{
                  background: '#1A6B4A18',
                  border: 'none',
                  borderRadius: 6,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#1A6B4A',
                  flexShrink: 0,
                }}
              >
                <Check size={11} strokeWidth={2} />
              </button>
            </div>
          )
        })}

        {pending.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#5C6068', fontSize: 13 }}>
            {locale === 'fr' ? 'Aucune alerte en attente' : 'No pending alerts'}
          </div>
        )}
      </div>
    </div>
  )
}


