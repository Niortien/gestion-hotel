// components/reservations/ReservationTimeline.tsx
'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap.config'
import { useHotelStore } from '@/store/hotel-store'
import { useRooms } from '@/lib/queries/rooms'
import { useGuests } from '@/lib/queries/guests'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Reservation } from '@/types/hotel'
import { addDays, differenceInDays, format, startOfDay } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const STATUS_COLORS: Record<string, string> = {
  confirmee: '#B5924C',
  en_attente: '#1A6B4A',
  terminee:  '#5C6068',
  annulee:   '#8B1A2F',
  no_show:   '#607856',
}

interface Props {
  reservations: Reservation[]
}

export function ReservationTimeline({ reservations }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: rooms = [] } = useRooms()
  const { data: guests = [] } = useGuests()
  const containerRef = useRef<HTMLDivElement>(null)

  // Build a 14-day window from today
  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 2))

  // Unique rooms that have reservations
  const roomIds = [...new Set(reservations.map((r) => r.roomId))]
  const rows = roomIds.map((rid) => ({
    room: rooms.find((r) => r.id === rid),
    reservations: reservations.filter((r) => r.roomId === rid),
  })).filter((row) => row.room)

  useEffect(() => {
    if (!containerRef.current) return
    const bars = containerRef.current.querySelectorAll('.gantt-bar-anim')
    gsap.fromTo(
      bars,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out', delay: 0.1 }
    )
  }, [reservations])

  const DAY_WIDTH = 64
  const ROW_HEIGHT = 52

  const getBarProps = (res: Reservation) => {
    const start = startOfDay(new Date(res.checkIn))
    const end   = startOfDay(new Date(res.checkOut))
    const offsetDays = differenceInDays(start, days[0])
    const durationDays = differenceInDays(end, start)
    return {
      left: Math.max(0, offsetDays * DAY_WIDTH),
      width: durationDays * DAY_WIDTH,
      color: STATUS_COLORS[res.status] ?? '#5C6068',
    }
  }

  const dateFns = locale === 'fr' ? fr : enUS

  return (
    <div ref={containerRef} style={{ overflowX: 'auto' }}>
      {/* Day headers */}
      <div style={{ display: 'flex', marginLeft: 100, marginBottom: 4 }}>
        {days.map((day, i) => {
          const isToday = differenceInDays(day, today) === 0
          return (
            <div
              key={i}
              style={{
                width: DAY_WIDTH,
                flexShrink: 0,
                textAlign: 'center',
                fontSize: 11,
                fontFamily: 'var(--font-dm-mono), monospace',
                color: isToday ? '#B5924C' : '#5C6068',
                fontWeight: isToday ? 700 : 400,
                borderBottom: isToday ? '2px solid #B5924C' : '1px solid #EDE8DF',
                paddingBottom: 4,
              }}
            >
              {format(day, 'dd', { locale: dateFns })}
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5C6068' }}>
                {format(day, 'EEE', { locale: dateFns })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Room rows */}
      {rows.map(({ room, reservations: rrows }) => (
        <div
          key={room!.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: ROW_HEIGHT,
            borderBottom: '1px solid #EDE8DF',
            position: 'relative',
          }}
        >
          {/* Room label */}
          <div
            style={{
              width: 100,
              flexShrink: 0,
              paddingRight: 10,
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 13,
              fontWeight: 700,
              color: '#3D1F0F',
            }}
          >
            {room!.number}
            <div style={{ fontSize: 9, color: '#5C6068', fontFamily: 'inherit', fontWeight: 400 }}>
              {room!.type}
            </div>
          </div>

          {/* Grid lines + bars */}
          <div style={{ position: 'relative', flex: 1, height: '100%' }}>
            {/* Day grid */}
            {days.map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * DAY_WIDTH,
                  top: 0,
                  width: DAY_WIDTH,
                  height: '100%',
                  borderRight: '1px solid #EDE8DF',
                  background: i % 2 === 0 ? 'transparent' : '#FAF7F200',
                }}
              />
            ))}

            {/* Today highlight */}
            <div
              style={{
                position: 'absolute',
                left: 2 * DAY_WIDTH, // index 2 is today (started -2)
                top: 0,
                width: DAY_WIDTH,
                height: '100%',
                background: '#B5924C08',
              }}
            />

            {/* Reservation bars */}
            {rrows.map((res) => {
              const { left, width, color } = getBarProps(res)
              if (width <= 0) return null
              const guest = guests.find((g) => g.id === res.guestId)
              return (
                <div
                  key={res.id}
                  className="gantt-bar gantt-bar-anim"
                  title={`${guest?.firstName} ${guest?.lastName} (${res.status})`}
                  style={{
                    position: 'absolute',
                    left,
                    top: 8,
                    width: Math.min(width, DAY_WIDTH * 14 - left),
                    height: ROW_HEIGHT - 16,
                    background: `${color}22`,
                    border: `1px solid ${color}66`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#3D1F0F',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {guest?.firstName} {guest?.lastName?.charAt(0)}.
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
