// components/common/LanguageSwitcher.tsx
'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { useHotelStore } from '@/store/hotel-store'

export function LanguageSwitcher() {
  const locale = useHotelStore((s) => s.locale)
  const setLocale = useHotelStore((s) => s.setLocale)
  const pillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pillRef.current) return
    gsap.to(pillRef.current, {
      x: locale === 'fr' ? 0 : 28,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [locale])

  return (
    <div
      title="Langue / Language"
      style={{
        width: 56,
        height: 28,
        background: '#EDE8DF',
        borderRadius: 99,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2px',
        border: '1px solid #D4C9B8',
        flexShrink: 0,
      }}
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
    >
      {/* Pill */}
      <div
        ref={pillRef}
        style={{
          position: 'absolute',
          left: 2,
          width: 24,
          height: 22,
          background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
          borderRadius: 99,
          boxShadow: '0 1px 4px rgba(181,146,76,0.4)',
        }}
      />
      {/* Labels */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          width: 26,
          textAlign: 'center',
          color: locale === 'fr' ? '#FAF7F2' : '#5C6068',
          transition: 'color 0.2s',
          userSelect: 'none',
        }}
      >
        FR
      </span>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          width: 26,
          textAlign: 'center',
          color: locale === 'en' ? '#FAF7F2' : '#5C6068',
          transition: 'color 0.2s',
          userSelect: 'none',
        }}
      >
        EN
      </span>
    </div>
  )
}
