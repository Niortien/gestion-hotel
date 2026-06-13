// components/dashboard/RevenueStrip.tsx
'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { formatPrice, formatDateShort } from '@/lib/utils/format'
import { useHotelStore } from '@/store/hotel-store'
import { useDashboardRevenue } from '@/lib/queries/dashboard'
import { TrendingUp, ArrowRight } from 'lucide-react'

export function RevenueStrip() {
  const stripRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const { data: revenueData = [] } = useDashboardRevenue(7)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    gsap.to(strip, {
      x: '-50%',
      duration: 28,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          const val = parseFloat(String(x))
          return val <= -50 ? val + 50 : val
        }, '%'),
      },
    })

    return () => { gsap.killTweensOf(strip) }
  }, [])

  // Duplicate for seamless loop
  const items = [...revenueData, ...revenueData]

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #3D1F0F, #5C2E12)',
        borderRadius: 12,
        padding: '10px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
      data-animate
    >
      {/* Edge fades */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(90deg, #3D1F0F, transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(270deg, #3D1F0F, transparent)', zIndex: 2 }} />

      <div
        ref={stripRef}
        className="ticker-strip"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 32, paddingLeft: 20 }}
      >
        {items.map((day, i) => (
          <div
            key={`${day.date}-${i}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}
          >
            <span style={{ fontSize: 11, color: '#D4AF72', opacity: 0.7 }}>
              {formatDateShort(day.date, locale)}
            </span>
            <ArrowRight size={10} strokeWidth={1.5} style={{ color: '#B5924C' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} strokeWidth={1.25} style={{ color: '#D4AF72' }} />
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#D4AF72',
                }}
              >
                {formatPrice(day.total, 'FCFA', locale === 'fr' ? 'fr-FR' : 'en-GB')}
              </span>
            </div>
            <span
              style={{ width: 1, height: 16, background: '#B5924C44', flexShrink: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

