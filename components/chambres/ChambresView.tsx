// components/chambres/ChambresView.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useRooms } from '@/lib/hooks/useRooms'
import { useHotelStore } from '@/store/hotel-store'
import { AnimatedSearchBar } from '@/components/common/AnimatedSearchBar'
import { SearchResults } from '@/components/common/SearchResults'
import { StatusBadge } from '@/components/common/StatusBadge'
import { RoomFilters } from './RoomFilters'
import { RoomGrid } from './RoomGrid'
import { RoomDetailPanel } from './RoomDetailPanel'
import { FloorMap } from './FloorMap'
import { RoomCreateModal } from './RoomCreateModal'
import { useAnimatedSearch } from '@/lib/hooks/useAnimatedSearch'
import type { Room, RoomType, RoomStatus } from '@/types/hotel'
import { LayoutGrid, Map, Plus } from 'lucide-react'

export function ChambresView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [activeFloor, setActiveFloor] = useState<number | null>(null)
  const [activeType, setActiveType] = useState<RoomType | null>(null)
  const [activeStatus, setActiveStatus] = useState<RoomStatus | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const allRooms = useRooms().allRooms

  const { rooms: filtered } = useRooms({
    floor: activeFloor,
    type: activeType,
    status: activeStatus,
  })

  const {
    query,
    results,
    showResults,
    isSearching,
    resultsContainerRef: searchResultsRef,
    handleFocus,
    handleBlur,
    handleChange,
  } = useAnimatedSearch<Room>(
    allRooms,
    (room, q) => {
      const lq = q.toLowerCase()
      return (
        room.number.toLowerCase().includes(lq) ||
        room.type.toLowerCase().includes(lq) ||
        room.status.toLowerCase().includes(lq) ||
        String(room.floor).includes(lq)
      )
    }
  )

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const roomsToShow = query ? results : filtered
  const selectedRoom = selectedRoomId ? allRooms.find((r) => r.id === selectedRoomId) ?? null : null

  return (
    <div ref={pageRef} style={{ maxWidth: 1200, margin: '0 auto' }}>
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
              {locale === 'fr' ? 'Chambres' : 'Rooms'}
            </h1>
            <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
              {locale === 'fr' ? 'Gestion du parc hôtelier' : 'Hotel room management'}
            </p>
          </div>

          {/* View toggle + Add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Add room */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                background: '#B5924C', border: 'none', borderRadius: 10,
                color: '#FAF7F2', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(181,146,76,0.3)',
              }}
            >
              <Plus size={14} strokeWidth={2} />
              {locale === 'fr' ? 'Ajouter' : 'Add room'}
            </button>

            {/* View toggle */}
            <div
              style={{
                display: 'flex',
                background: '#EDE8DF',
                borderRadius: 10,
                padding: 3,
                gap: 2,
              }}
            >
            {[
              { mode: 'grid' as const, Icon: LayoutGrid, label: locale === 'fr' ? 'Grille' : 'Grid' },
              { mode: 'map'  as const, Icon: Map,        label: locale === 'fr' ? 'Plan'  : 'Map' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: viewMode === mode ? '#FFFFFF' : 'transparent',
                  color: viewMode === mode ? '#B5924C' : '#5C6068',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: viewMode === mode ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: viewMode === mode ? '0 1px 4px rgba(61,31,15,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={13} strokeWidth={1.25} />
                {label}
              </button>
            ))}
            </div>
          </div>
        </div>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Search + Filters */}
      <div data-animate style={{ marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 480, marginBottom: 16 }}>
          <AnimatedSearchBar
            value={query}
            onChange={handleChange}
            label={locale === 'fr' ? 'Chambre, étage, type ou statut…' : 'Room, floor, type or status…'}
            isSearching={isSearching}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {showResults && (
            <SearchResults
              items={results.map((r) => ({
                id: r.id,
                primary: `Chambre ${r.number}`,
                secondary: `Étage ${r.floor} — ${r.type}`,
                badge: <StatusBadge status={r.status} locale={locale} size="sm" />,
                onClick: () => setSelectedRoomId(r.id),
              }))}
              query={query}
              containerRef={searchResultsRef}
              visible={showResults}
            />
          )}
        </div>

        {/* Filters */}
        <RoomFilters
          activeFloor={activeFloor}
          activeType={activeType}
          activeStatus={activeStatus}
          onFloor={setActiveFloor}
          onType={setActiveType}
          onStatus={setActiveStatus}
        />
      </div>

      {/* Results count */}
      <div
        data-animate
        style={{ fontSize: 12, color: '#5C6068', marginBottom: 16 }}
      >
        {roomsToShow.length} {locale === 'fr' ? 'chambre(s)' : 'room(s)'}
        {activeStatus && (
          <> · <StatusBadge status={activeStatus} locale={locale} size="sm" /></>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <RoomGrid rooms={roomsToShow} onRoomClick={(r) => setSelectedRoomId(r.id)} />
      ) : (
        <FloorMap rooms={roomsToShow} onRoomClick={(r) => setSelectedRoomId(r.id)} />
      )}

      {/* Detail Panel */}
      {selectedRoom && (
        <RoomDetailPanel room={selectedRoom} onClose={() => setSelectedRoomId(null)} />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <RoomCreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
