// components/chambres/RoomGrid.tsx
'use client'

import { useRef, useEffect } from 'react'
import { formatAmount } from '@/lib/utils/format'
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { gsap } from '@/lib/animations/gsap.config'
import { useHotelStore } from '@/store/hotel-store'
import { useUpdateRoomStatus } from '@/lib/queries/rooms'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Room } from '@/types/hotel'
import { Users, Maximize2 } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  libre:     '#1A6B4A18',
  occupee:   '#8B1A2F18',
  nettoyage: '#60785618',
  travaux:   '#C9A84C20',
}
const STATUS_BORDER: Record<string, string> = {
  libre:     '#1A6B4A44',
  occupee:   '#8B1A2F44',
  nettoyage: '#60785644',
  travaux:   '#C9A84C44',
}
const STATUS_ACCENT: Record<string, string> = {
  libre:     '#1A6B4A',
  occupee:   '#8B1A2F',
  nettoyage: '#607856',
  travaux:   '#C9A84C',
}

function DraggableRoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: room.id })
  const locale = useHotelStore((s) => s.locale)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        background: STATUS_COLORS[room.status],
        border: `1.5px solid ${STATUS_BORDER[room.status]}`,
        borderRadius: 14,
        padding: '12px 14px',
        cursor: 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transition: 'box-shadow 0.2s, transform 0.15s',
        boxShadow: isDragging ? 'none' : '0 2px 8px rgba(61,31,15,0.06)',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2.5,
          background: STATUS_ACCENT[room.status],
          borderRadius: '14px 14px 0 0',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 20,
          fontWeight: 700,
          color: '#3D1F0F',
          marginTop: 4,
        }}
      >
        {room.number}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 12,
          fontStyle: 'italic',
          color: '#B5924C',
          marginBottom: 8,
        }}
      >
        {room.type}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge status={room.status} locale={locale} size="sm" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#5C6068', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Users size={10} strokeWidth={1.25} />{room.capacity}
        </span>
        <span style={{ fontSize: 11, color: '#5C6068', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Maximize2 size={10} strokeWidth={1.25} />{room.surface}m²
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 11,
            color: '#B5924C',
            fontWeight: 600,
            marginLeft: 'auto',
          }}
        >
          {room.basePrice}€
        </span>
      </div>
    </div>
  )
}

function DroppableCell({ room, onClick }: { room: Room; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${room.id}` })
  return (
    <div
      ref={setNodeRef}
      style={{
        outline: isOver ? '2px dashed #B5924C' : 'none',
        borderRadius: 14,
        transition: 'outline 0.15s',
      }}
    >
      <DraggableRoomCard room={room} onClick={onClick} />
    </div>
  )
}

interface Props {
  rooms: Room[]
  onRoomClick: (room: Room) => void
}

export function RoomGrid({ rooms, onRoomClick }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const updateStatusMutation = useUpdateRoomStatus()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('[data-grid-item]')
    gsap.fromTo(cards, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.03, ease: 'power2.out' })
  }, [rooms.length])

  const byFloor = new Map<number, Room[]>()
  rooms.forEach((r) => {
    const arr = byFloor.get(r.floor) ?? []
    arr.push(r)
    byFloor.set(r.floor, arr)
  })
  const floors = Array.from(byFloor.keys()).sort()

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event
    if (over && String(over.id).startsWith('drop-')) {
      const targetRoomId = String(over.id).replace('drop-', '')
      const targetRoom = rooms.find((r) => r.id === targetRoomId)
      if (targetRoom && targetRoom.status === 'libre') {
        // Mark room as occupied when a guest is dragged onto it
        updateStatusMutation.mutate({ id: Number(targetRoomId), status: 'occupee' })
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div ref={gridRef}>
        {floors.map((floor) => (
          <div key={floor} style={{ marginBottom: 28 }}>
            {/* Floor label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#B5924C',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {locale === 'fr' ? 'ÉTAGE' : 'FLOOR'} {floor}
              </span>
              <div style={{ flex: 1, height: 1, background: '#EDE8DF' }} />
              <span style={{ fontSize: 11, color: '#5C6068' }}>
                {byFloor.get(floor)?.length ?? 0} {locale === 'fr' ? 'chambres' : 'rooms'}
              </span>
            </div>

            {/* Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 12,
              }}
            >
              {(byFloor.get(floor) ?? []).map((room) => (
                <div key={room.id} data-grid-item>
                  <DroppableCell room={room} onClick={() => onRoomClick(room)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
