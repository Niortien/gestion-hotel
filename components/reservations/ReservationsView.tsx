// components/reservations/ReservationsView.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { SimpleModal } from '@/components/common/ui'
import { Drawer } from '@/components/common/ui'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useReservations as useReservationsHook } from '@/lib/hooks/useReservations'
import { AnimatedSearchBar } from '@/components/common/AnimatedSearchBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ReservationRow } from './ReservationRow'
import { ReservationTimeline } from './ReservationTimeline'
import { ReservationForm } from './ReservationForm'
import { ReservationDetailPanel } from './ReservationDetailPanel'
import { useAnimatedSearch } from '@/lib/hooks/useAnimatedSearch'
import type { Reservation, ReservationStatus } from '@/types/hotel'
import { Plus, CalendarRange, List } from 'lucide-react'

const STATUSES: ReservationStatus[] = ['confirmee', 'en_attente', 'terminee', 'annulee', 'no_show']

export function ReservationsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const { allReservations: allRes } = useReservationsHook()
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [newOpen, setNewOpen] = useState(false)
  const [selected, setSelected] = useState<Reservation | null>(null)

  const {
    query,
    results,
    showResults,
    isSearching,
    resultsContainerRef,
    handleFocus,
    handleBlur,
    handleChange,
  } = useAnimatedSearch<Reservation>(
    allRes,
    (r, q) => {
      const lq = q.toLowerCase()
      return r.id.toLowerCase().includes(lq) || r.roomId.includes(lq) || r.guestId.includes(lq)
    }
  )

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const base = query ? results : allRes
  const displayed = filterStatus ? base.filter((r) => r.status === filterStatus) : base

  return (
    <div ref={pageRef} style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {locale === 'fr' ? 'Réservations' : 'Reservations'}
            </h1>
            <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
              {locale === 'fr' ? 'Planification et suivi des séjours' : 'Stay planning and tracking'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#EDE8DF', borderRadius: 10, padding: 3, gap: 2 }}>
              {[
                { mode: 'list'     as const, Icon: List,         label: locale === 'fr' ? 'Liste'    : 'List' },
                { mode: 'timeline' as const, Icon: CalendarRange, label: locale === 'fr' ? 'Gantt'   : 'Gantt' },
              ].map(({ mode, Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: viewMode === mode ? '#FFFFFF' : 'transparent', color: viewMode === mode ? '#B5924C' : '#5C6068', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === mode ? 600 : 400, display: 'flex', alignItems: 'center', gap: 5, boxShadow: viewMode === mode ? '0 1px 4px rgba(61,31,15,0.08)' : 'none', transition: 'all 0.15s' }}>
                  <Icon size={13} strokeWidth={1.25} />{label}
                </button>
              ))}
            </div>

            {/* New reservation */}
            <button
              onClick={() => setNewOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(181,146,76,0.25)' }}
            >
              <Plus size={14} strokeWidth={2} />
              {locale === 'fr' ? 'Nouvelle réservation' : 'New reservation'}
            </button>
          </div>
        </div>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Status filter chips */}
      <div data-animate style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setFilterStatus(null)}
          style={{
            padding: '5px 14px',
            borderRadius: 99,
            border: '1px solid',
            borderColor: filterStatus === null ? '#B5924C' : '#EDE8DF',
            background: filterStatus === null ? '#B5924C18' : '#FFFFFF',
            color: filterStatus === null ? '#B5924C' : '#5C6068',
            fontSize: 12,
            fontWeight: filterStatus === null ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          {locale === 'fr' ? 'Toutes' : 'All'} ({allRes.length})
        </button>
        {STATUSES.map((s) => {
          const cnt = allRes.filter((r) => r.status === s).length
          if (cnt === 0) return null
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? null : s)}
              style={{
                padding: '5px 14px',
                borderRadius: 99,
                border: '1px solid',
                borderColor: filterStatus === s ? '#B5924C' : '#EDE8DF',
                background: filterStatus === s ? '#B5924C18' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
              }}
            >
              <StatusBadge status={s} locale={locale} size="sm" />
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11 }}>({cnt})</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div data-animate style={{ position: 'relative', maxWidth: 420, marginBottom: 20 }}>
        <AnimatedSearchBar
          value={query}
          onChange={handleChange}
          label={locale === 'fr' ? 'Rechercher une réservation…' : 'Search reservations…'}
          isSearching={isSearching}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Content */}
      <div data-animate>
        {viewMode === 'timeline' ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 16, padding: '16px' }}>
            <ReservationTimeline reservations={displayed} />
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr 80px 100px 80px', gap: 12, padding: '6px 16px', marginBottom: 6 }}>
              {[
                locale === 'fr' ? 'Client'  : 'Guest',
                locale === 'fr' ? 'Chambre' : 'Room',
                locale === 'fr' ? 'Séjour'  : 'Stay',
                locale === 'fr' ? 'Pers.'   : 'Pax',
                locale === 'fr' ? 'Montant' : 'Amount',
                'Statut',
              ].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#5C6068', fontSize: 14 }}>
                  {locale === 'fr' ? 'Aucune réservation' : 'No reservations found'}
                </div>
              ) : (
                displayed.map((res) => (
                  <ReservationRow key={res.id} reservation={res} onSelect={setSelected} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <SimpleModal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        title={locale === 'fr' ? 'Nouvelle réservation' : 'New reservation'}
        width={560}
      >
        <ReservationForm onClose={() => setNewOpen(false)} />
      </SimpleModal>

      {/* Reservation detail panel */}
      {selected && (
        <Drawer
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={locale === 'fr' ? 'Détail réservation' : 'Reservation detail'}
          width={480}
        >
          <ReservationDetailPanel
            reservationId={selected.id}
            snapshot={selected}
            onClose={() => setSelected(null)}
          />
        </Drawer>
      )}
    </div>
  )
}
