// components/chambres/FloorMap.tsx
'use client'

import { useHotelStore } from '@/store/hotel-store'
import type { Room } from '@/types/hotel'

const STATUS_COLOR: Record<string, string> = {
  libre:     '#1A6B4A',
  occupee:   '#8B1A2F',
  nettoyage: '#607856',
  travaux:   '#C9A84C',
}

interface Props {
  rooms: Room[]
  onRoomClick: (room: Room) => void
}

export function FloorMap({ rooms, onRoomClick }: Props) {
  const locale = useHotelStore((s) => s.locale)

  const byFloor = new Map<number, Room[]>()
  rooms.forEach((r) => {
    const arr = byFloor.get(r.floor) ?? []
    arr.push(r)
    byFloor.set(r.floor, arr)
  })
  const floors = Array.from(byFloor.keys()).sort().reverse()

  return (
    <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {floors.map((floor) => {
        const floorRooms = byFloor.get(floor) ?? []
        return (
          <div key={floor}>
            {/* Floor label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#B5924C',
                  letterSpacing: '0.08em',
                }}
              >
                {locale === 'fr' ? 'ÉTAGE' : 'FLOOR'} {floor}
              </span>
              <div style={{ flex: 1, height: 1, background: '#EDE8DF' }} />
            </div>

            {/* Corridor + Rooms */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #EDE8DF',
                overflow: 'hidden',
              }}
            >
              {/* Top rooms */}
              <div style={{ display: 'flex', borderBottom: '1px solid #EDE8DF' }}>
                {floorRooms.slice(0, Math.ceil(floorRooms.length / 2)).map((room) => (
                  <RoomCell key={room.id} room={room} onClick={() => onRoomClick(room)} />
                ))}
              </div>

              {/* Corridor */}
              <div
                style={{
                  height: 28,
                  background: '#EDE8DF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 9, color: '#5C6068', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {locale === 'fr' ? '— couloir —' : '— corridor —'}
                </span>
              </div>

              {/* Bottom rooms */}
              <div style={{ display: 'flex' }}>
                {floorRooms.slice(Math.ceil(floorRooms.length / 2)).map((room) => (
                  <RoomCell key={room.id} room={room} onClick={() => onRoomClick(room)} />
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 4 }}>
        {[
          { status: 'libre',     labelFr: 'Libre',     labelEn: 'Available' },
          { status: 'occupee',   labelFr: 'Occupée',   labelEn: 'Occupied' },
          { status: 'nettoyage', labelFr: 'Nettoyage', labelEn: 'Cleaning' },
          { status: 'travaux',   labelFr: 'Travaux',   labelEn: 'Maint.' },
        ].map(({ status, labelFr, labelEn }) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: STATUS_COLOR[status],
                opacity: 0.7,
              }}
            />
            <span style={{ fontSize: 11, color: '#5C6068' }}>
              {locale === 'fr' ? labelFr : labelEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoomCell({ room, onClick }: { room: Room; onClick: () => void }) {
  const color = STATUS_COLOR[room.status] ?? '#5C6068'
  return (
    <div
      onClick={onClick}
      title={`Chambre ${room.number} — ${room.status}`}
      style={{
        flex: 1,
        minWidth: 60,
        padding: '10px 8px',
        background: `${color}14`,
        borderRight: '1px solid #EDE8DF',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        transition: 'background 0.15s',
        borderLeft: `3px solid ${color}`,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${color}28` }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${color}14` }}
    >
      <span
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 13,
          fontWeight: 700,
          color: '#3D1F0F',
        }}
      >
        {room.number}
      </span>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
        }}
      />
    </div>
  )
}
