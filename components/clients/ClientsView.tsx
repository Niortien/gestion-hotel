// components/clients/ClientsView.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { SimpleModal } from '@/components/common/ui'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useGuests } from '@/lib/hooks/useGuests'
import { AnimatedSearchBar } from '@/components/common/AnimatedSearchBar'
import { SearchResults } from '@/components/common/SearchResults'
import { GuestList } from './GuestList'
import { CheckInForm } from './CheckInForm'
import { useAnimatedSearch } from '@/lib/hooks/useAnimatedSearch'
import type { Guest } from '@/types/hotel'
import { UserPlus, Users, Crown } from 'lucide-react'

export function ClientsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const { allGuests } = useGuests()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [filterVip, setFilterVip] = useState(false)

  const {
    query,
    results,
    showResults,
    isSearching,
    resultsContainerRef,
    handleFocus,
    handleBlur,
    handleChange,
  } = useAnimatedSearch<Guest>(
    allGuests,
    (guest, q) => {
      const lq = q.toLowerCase()
      return (
        guest.firstName.toLowerCase().includes(lq) ||
        guest.lastName.toLowerCase().includes(lq) ||
        guest.email.toLowerCase().includes(lq) ||
        guest.phone.includes(lq)
      )
    }
  )

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const baseList = query ? results : allGuests
  const displayed = filterVip ? baseList.filter((g) => g.vip) : baseList
  const vipCount = allGuests.filter((g) => g.vip).length

  return (
    <div ref={pageRef} style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 42,
                fontWeight: 300,
                color: '#3D1F0F',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              {locale === 'fr' ? 'Clients' : 'Guests'}
            </h1>
            <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
              {locale === 'fr' ? 'Gestion de la clientèle' : 'Guest management'}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* VIP filter */}
            <button
              onClick={() => setFilterVip(!filterVip)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                border: filterVip ? '1px solid #B5924C' : '1px solid #EDE8DF',
                background: filterVip ? '#B5924C18' : '#FFFFFF',
                color: filterVip ? '#B5924C' : '#5C6068',
                fontSize: 13,
                fontWeight: filterVip ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Crown size={13} strokeWidth={1.25} />
              VIP
              <span
                style={{
                  background: filterVip ? '#B5924C' : '#EDE8DF',
                  color: filterVip ? '#FFFFFF' : '#5C6068',
                  borderRadius: 99,
                  padding: '0 6px',
                  fontSize: 10,
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontWeight: 700,
                }}
              >
                {vipCount}
              </span>
            </button>

            {/* New check-in */}
            <button
              onClick={() => setCheckInOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
                color: '#FAF7F2',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(181,146,76,0.25)',
              }}
            >
              <UserPlus size={14} strokeWidth={1.5} />
              {locale === 'fr' ? 'Nouveau check-in' : 'New check-in'}
            </button>
          </div>
        </div>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Stats row */}
      <div data-animate style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          {
            label: locale === 'fr' ? 'Total clients' : 'Total guests',
            value: allGuests.length,
            icon: Users,
          },
          {
            label: 'VIP',
            value: vipCount,
            icon: Crown,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDE8DF',
              borderRadius: 12,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#B5924C12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#3D1F0F',
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: 11, color: '#5C6068', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div data-animate style={{ position: 'relative', maxWidth: 480, marginBottom: 20 }}>
        <AnimatedSearchBar
          value={query}
          onChange={handleChange}
          label={locale === 'fr' ? 'Nom, email ou téléphone…' : 'Name, email or phone…'}
          isSearching={isSearching}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showResults && (
          <SearchResults
            items={results.map((g) => ({
              id: g.id,
              primary: `${g.firstName} ${g.lastName}`,
              secondary: g.email,
            }))}
            query={query}
            containerRef={resultsContainerRef}
            visible={showResults}
          />
        )}
      </div>

      {/* Count */}
      <div data-animate style={{ fontSize: 12, color: '#5C6068', marginBottom: 12 }}>
        {displayed.length} {locale === 'fr' ? 'client(s)' : 'guest(s)'}
      </div>

      {/* Guest list */}
      <GuestList guests={displayed} />

      {/* Check-in modal */}
      <SimpleModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        title={locale === 'fr' ? 'Nouveau check-in' : 'New check-in'}
        width={540}
      >
        <CheckInForm onClose={() => setCheckInOpen(false)} />
      </SimpleModal>
    </div>
  )
}
