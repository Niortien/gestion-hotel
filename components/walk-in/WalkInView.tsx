// components/walk-in/WalkInView.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useHotelStore } from '@/store/hotel-store'
import { useGuests, useCreateGuest } from '@/lib/queries/guests'
import { useRooms, useUpdateRoomStatus } from '@/lib/queries/rooms'
import { useServices } from '@/lib/queries/services'
import { useCreateReservation, useUpdateReservationStatus } from '@/lib/queries/reservations'
import { getReservations } from '@/lib/api/reservations'
import { ApiError } from '@/lib/api/client'
import { getNights, formatAmount, CURRENCY_OPTIONS } from '@/lib/utils/format'
import type { Currency } from '@/lib/utils/format'
import type { Room, Reservation } from '@/types/hotel'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import {
  Moon, Clock, UserPlus, Users, Plus, Minus,
  ChevronLeft, ChevronRight, DoorOpen, CheckCircle,
  BedDouble, CalendarDays, TrendingUp, X, Wrench, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Zod schema ────────────────────────────────────────────────────────────────

const existingGuestSchema = z.object({
  clientMode:    z.literal('existing'),
  stayType:      z.enum(['NUIT', 'PASSAGE']),
  guestId:       z.string().min(1, 'Requis'),
  checkIn:       z.string().min(1, 'Requis'),
  checkOut:      z.string().optional(),
  durationHours: z.string().optional(),
  currency:      z.enum(['FCFA', 'EUR', 'USD']),
  newFirstName:  z.string().optional(),
  newLastName:   z.string().optional(),
  newPhone:      z.string().optional(),
  newEmail:      z.string().optional(),
})

const newGuestSchema = z.object({
  clientMode:    z.literal('new'),
  stayType:      z.enum(['NUIT', 'PASSAGE']),
  guestId:       z.string().optional(),
  checkIn:       z.string().min(1, 'Requis'),
  checkOut:      z.string().optional(),
  durationHours: z.string().optional(),
  currency:      z.enum(['FCFA', 'EUR', 'USD']),
  newFirstName:  z.string().min(1, 'Requis'),
  newLastName:   z.string().min(1, 'Requis'),
  newPhone:      z.string().min(1, 'Requis'),
  newEmail:      z.string().email('Email invalide').or(z.literal('')).optional(),
})

const schema = z.discriminatedUnion('clientMode', [existingGuestSchema, newGuestSchema])
  .superRefine((data, ctx) => {
    if (data.stayType === 'NUIT' && !data.checkOut) {
      ctx.addIssue({ code: 'custom', path: ['checkOut'], message: 'Requis' })
    }
    if (data.stayType === 'PASSAGE') {
      if (!data.durationHours) {
        ctx.addIssue({ code: 'custom', path: ['durationHours'], message: 'Requis' })
      } else {
        const h = parseInt(data.durationHours, 10)
        if (isNaN(h) || h < 1 || h > 23) {
          ctx.addIssue({ code: 'custom', path: ['durationHours'], message: '1–23h' })
        }
      }
    }
  })

type FormData = z.infer<typeof schema>

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  libre:     { fr: 'Libre',     en: 'Available', color: '#1A6B4A', bg: '#E8F5F0', border: '#1A6B4A30' },
  occupee:   { fr: 'Occupée',   en: 'Occupied',  color: '#B5924C', bg: '#FAF7F2', border: '#B5924C40' },
  nettoyage: { fr: 'Nettoyage', en: 'Cleaning',  color: '#2563EB', bg: '#EFF6FF', border: '#2563EB30' },
  travaux:   { fr: 'Travaux',   en: 'Maintenance', color: '#8B1A2F', bg: '#FEF2F2', border: '#8B1A2F30' },
}

const ROOM_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  standard: { fr: 'Standard', en: 'Standard' },
  deluxe:   { fr: 'Deluxe',   en: 'Deluxe' },
  suite:    { fr: 'Suite',    en: 'Suite' },
  prestige: { fr: 'Prestige', en: 'Prestige' },
}

// ─── Main component ────────────────────────────────────────────────────────────

export function WalkInView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale  = useHotelStore((s) => s.locale)
  const qc      = useQueryClient()

  const today = new Date().toISOString().slice(0, 10)

  // ── State ───────────────────────────────────────────────────────────────────
  const [statsDate,   setStatsDate]   = useState(today)
  const [wizardRoom,  setWizardRoom]  = useState<Room | null>(null)
  const [wizardStep,  setWizardStep]  = useState<1 | 2>(1)
  const [clientMode,  setClientMode]  = useState<'existing' | 'new'>('existing')
  const [serviceQtys, setServiceQtys] = useState<Record<string, number>>({})
  const [step1Error,  setStep1Error]  = useState('')

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: rooms    = [] } = useRooms()
  const { data: guests   = [] } = useGuests()
  const { data: services = [] } = useServices()

  const { data: activeRes = [] } = useQuery({
    queryKey: ['reservations', 'active'],
    queryFn:  () => getReservations({ active: true, limit: 100 }),
    staleTime: 15_000,
  })

  const { data: statsRes = [] } = useQuery({
    queryKey: ['reservations', 'walkin-stats', statsDate],
    queryFn:  () => getReservations({
      checkInFrom: statsDate,
      checkInTo:   statsDate + 'T23:59:59',
      limit: 300,
    }),
    staleTime: 30_000,
  })

  // ── Computed ────────────────────────────────────────────────────────────────
  const walkInsDay  = statsRes.filter((r) => r.isWalkIn)
  const resvDay     = statsRes.filter((r) => !r.isWalkIn)
  const freeRooms   = rooms.filter((r) => r.status === 'libre')
  const walkInRev   = walkInsDay.reduce((s, r) => s + r.totalAmount, 0)

  // Map roomId (string) → CHECKIN reservation
  const checkInResMap = new Map<string, Reservation>(
    activeRes
      .filter((r) => r.status === 'checkin')
      .map((r) => [r.roomId, r])
  )

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createReservation = useCreateReservation()
  const createGuest       = useCreateGuest()
  const updateStatus      = useUpdateReservationStatus()
  const updateRoomStatus  = useUpdateRoomStatus()

  // ── Form ────────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientMode: 'existing',
      stayType:   'NUIT',
      currency:   'FCFA' as Currency,
      checkIn:    today,
    },
  })

  const stayType         = watch('stayType')
  const checkIn          = watch('checkIn')
  const checkOut         = watch('checkOut')
  const durationHoursRaw = watch('durationHours')
  const durationHours    = durationHoursRaw ? parseInt(String(durationHoursRaw), 10) : 0
  const currency         = watch('currency') as Currency
  const guestId          = watch('guestId')
  const newFirstName     = watch('newFirstName')
  const newLastName      = watch('newLastName')
  const newPhone         = watch('newPhone')

  const nights       = stayType === 'NUIT' && checkIn && checkOut ? getNights(checkIn, checkOut) : 0
  const roomTotal    = wizardRoom
    ? stayType === 'NUIT'
      ? wizardRoom.basePrice * Math.max(nights, 0)
      : wizardRoom.basePrice * (Math.max(durationHours, 0) / 24)
    : 0
  const servicesTotal = Object.entries(serviceQtys).reduce((acc, [sId, qty]) => {
    const svc = services.find((s) => s.id === sId)
    return acc + (svc ? svc.unitPrice * qty : 0)
  }, 0)
  const grandTotal = roomTotal + servicesTotal

  // ── Handlers ────────────────────────────────────────────────────────────────
  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const setQty = (id: string, delta: number) => {
    setServiceQtys((prev) => {
      const next = (prev[id] ?? 0) + delta
      if (next <= 0) { const { [id]: _, ...rest } = prev; return rest }
      return { ...prev, [id]: next }
    })
  }

  const switchClientMode = (mode: 'existing' | 'new') => {
    setClientMode(mode)
    setValue('clientMode', mode)
    setValue('guestId', '')
    setStep1Error('')
  }

  const openWizard = (room: Room) => {
    setWizardRoom(room)
    setWizardStep(1)
    setClientMode('existing')
    setServiceQtys({})
    setStep1Error('')
    reset({ clientMode: 'existing', stayType: 'NUIT', currency: 'FCFA' as Currency, checkIn: today })
  }

  const closeWizard = () => {
    setWizardRoom(null)
    setWizardStep(1)
    setStep1Error('')
    reset()
  }

  const canAdvanceStep1 = () => {
    if (clientMode === 'existing') {
      if (!guestId) {
        setStep1Error(locale === 'fr' ? 'Sélectionnez un client' : 'Select a guest')
        return false
      }
    } else {
      if (!newFirstName?.trim() || !newLastName?.trim() || !newPhone?.trim()) {
        setStep1Error(locale === 'fr' ? 'Prénom, nom et téléphone requis' : 'First name, last name and phone required')
        return false
      }
    }
    setStep1Error('')
    return true
  }

  const handleCheckout = async (room: Room) => {
    const res = checkInResMap.get(room.id)
    if (!res) { toast.error(locale === 'fr' ? 'Réservation active introuvable' : 'Active reservation not found'); return }
    try {
      await updateStatus.mutateAsync({ id: res.id, status: 'terminee' })
      qc.invalidateQueries({ queryKey: ['reservations', 'walkin-stats'] })
      toast.success(locale === 'fr' ? `Chambre ${room.number} libérée` : `Room ${room.number} released`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur checkout')
    }
  }

  const handleRoomStatusChange = async (room: Room, newStatus: 'libre' | 'nettoyage' | 'travaux') => {
    try {
      await updateRoomStatus.mutateAsync({ id: Number(room.id), status: newStatus })
      toast.success(locale === 'fr' ? `Chambre ${room.number} → ${newStatus}` : `Room ${room.number} → ${newStatus}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur')
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!wizardRoom) return
    try {
      let resolvedGuestId = data.clientMode === 'existing' ? (data.guestId ?? '') : ''
      if (data.clientMode === 'new') {
        const g = await createGuest.mutateAsync({
          firstName: data.newFirstName!,
          lastName:  data.newLastName!,
          phone:     data.newPhone!,
          ...(data.newEmail ? { email: data.newEmail } : {}),
        })
        resolvedGuestId = g.id
      }

      const selectedServices = Object.entries(serviceQtys).map(([serviceId, quantity]) => ({ serviceId, quantity }))

      const res = await createReservation.mutateAsync({
        guestId:       resolvedGuestId,
        roomId:        wizardRoom.id,
        checkIn:       data.checkIn,
        ...(data.stayType === 'NUIT' ? { checkOut: data.checkOut! } : {}),
        stayType:      data.stayType,
        durationHours: data.stayType === 'PASSAGE' ? parseInt(String(data.durationHours!), 10) : undefined,
        totalAmount:   grandTotal > 0 ? grandTotal : undefined,
        currency:      data.currency,
        services:      selectedServices.length > 0 ? selectedServices : undefined,
        isWalkIn:      true,
      })

      await updateStatus.mutateAsync({ id: res.id, status: 'checkin' })
      qc.invalidateQueries({ queryKey: ['reservations', 'walkin-stats'] })

      toast.success(locale === 'fr'
        ? `Chambre ${wizardRoom.number} — Client enregistré !`
        : `Room ${wizardRoom.number} — Guest checked in!`)
      closeWizard()
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur lors de l\'enregistrement' : 'Check-in failed')
      toast.error(msg)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const sortedRooms = rooms.slice().sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true })
  )

  const formatStatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    })

  return (
    <div ref={pageRef} style={{ maxWidth: 1140, margin: '0 auto' }}>

      {/* Header */}
      <div data-animate style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #1A6B4A18, #2D9D6A12)',
            border: '1px solid #1A6B4A30',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DoorOpen size={22} strokeWidth={1.25} color="#1A6B4A" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 40, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {locale === 'fr' ? 'Accueil immédiat' : 'Walk-in'}
            </h1>
            <p style={{ color: '#5C6068', fontSize: 13, marginTop: 4 }}>
              {locale === 'fr' ? 'Gérez les chambres et enregistrez les clients directement' : 'Manage rooms and check in walk-in guests'}
            </p>
          </div>
        </div>

        {/* Stats date filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#5C6068' }}>
            {locale === 'fr' ? 'Stats du' : 'Stats for'}
          </span>
          <input
            type="date"
            value={statsDate}
            onChange={(e) => setStatsDate(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #EDE8DF',
              background: '#FFFFFF', color: '#3D1F0F', fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace', outline: 'none',
            }}
          />
          {statsDate !== today && (
            <button
              onClick={() => setStatsDate(today)}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #EDE8DF', background: '#FFFFFF',
                color: '#5C6068', fontSize: 12, cursor: 'pointer',
              }}
            >
              {locale === 'fr' ? "Aujourd'hui" : 'Today'}
            </button>
          )}
        </div>
      </div>

      <div className="brass-line" style={{ marginBottom: 20 }} />

      {/* KPI cards */}
      <div data-animate style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            label: locale === 'fr' ? 'Arrivées directes' : 'Walk-in arrivals',
            value: walkInsDay.length,
            sub:   locale === 'fr' ? `accueils directs · ${formatStatDate(statsDate)}` : `walk-ins · ${formatStatDate(statsDate)}`,
            color: '#1A6B4A', bg: '#E8F5F0', Icon: DoorOpen,
          },
          {
            label: locale === 'fr' ? 'Réservations' : 'Reservations',
            value: resvDay.length,
            sub:   locale === 'fr' ? `arrivées planifiées · ${formatStatDate(statsDate)}` : `planned · ${formatStatDate(statsDate)}`,
            color: '#B5924C', bg: '#FAF7F2', Icon: CalendarDays,
          },
          {
            label: locale === 'fr' ? 'Chambres libres' : 'Available rooms',
            value: freeRooms.length,
            sub:   locale === 'fr' ? `sur ${rooms.length} chambres` : `of ${rooms.length} rooms`,
            color: '#2563EB', bg: '#EFF6FF', Icon: BedDouble,
          },
          {
            label: locale === 'fr' ? 'CA direct' : 'Walk-in revenue',
            value: formatAmount(walkInRev, 'FCFA'),
            sub:   locale === 'fr' ? `accueils directs · ${formatStatDate(statsDate)}` : `walk-ins · ${formatStatDate(statsDate)}`,
            color: '#1A6B4A', bg: '#E8F5F0', Icon: TrendingUp,
          },
        ].map(({ label, value, sub, color, bg, Icon }) => (
          <div key={label} style={{
            background: '#FFFFFF', border: '1px solid #EDE8DF',
            borderRadius: 14, padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} strokeWidth={1.5} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 26, fontWeight: 700, color: '#3D1F0F', lineHeight: 1.1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Main body: room grid + wizard panel */}
      <div data-animate style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Room grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Grid header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontWeight: 400, color: '#3D1F0F' }}>
              {locale === 'fr' ? 'Vue des chambres' : 'Room overview'}
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 11, color: '#5C6068' }}>{locale === 'fr' ? cfg.fr : cfg.en}</span>
                </div>
              ))}
            </div>
          </div>

          {rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#FAF7F2', borderRadius: 16, border: '1px dashed #EDE8DF' }}>
              <BedDouble size={32} strokeWidth={1} color="#B5924C" style={{ marginBottom: 10 }} />
              <p style={{ color: '#5C6068', fontSize: 13 }}>
                {locale === 'fr' ? 'Aucune chambre configurée' : 'No rooms configured'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
              gap: 10,
            }}>
              {sortedRooms.map((room) => {
                const cfg  = STATUS_CFG[room.status] ?? STATUS_CFG.libre
                const res  = checkInResMap.get(room.id)
                const guest = res?.guest
                const isWalkInRoom = res?.isWalkIn
                const isSelected   = wizardRoom?.id === room.id

                return (
                  <div key={room.id} style={{
                    background: '#FFFFFF',
                    border: `2px solid ${isSelected ? '#1A6B4A' : cfg.border}`,
                    borderRadius: 14,
                    padding: '13px',
                    boxShadow: isSelected
                      ? '0 4px 20px rgba(26,107,74,0.15)'
                      : '0 1px 4px rgba(61,31,15,0.04)',
                    transition: 'all 0.15s',
                  }}>
                    {/* Number + dot */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 20, fontWeight: 700, color: '#3D1F0F', lineHeight: 1 }}>
                        {room.number}
                      </span>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    </div>

                    {/* Status label */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      {locale === 'fr' ? cfg.fr : cfg.en}
                    </div>

                    {room.status === 'occupee' ? (
                      <>
                        {guest && (
                          <div style={{ fontSize: 11, color: '#3D1F0F', fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {guest.firstName} {guest.lastName}
                          </div>
                        )}
                        <div style={{ marginBottom: 8 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            color: isWalkInRoom ? '#1A6B4A' : '#B5924C',
                            background: isWalkInRoom ? '#E8F5F0' : '#FAF7F2',
                            padding: '2px 7px', borderRadius: 99,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                          }}>
                            {isWalkInRoom
                              ? (locale === 'fr' ? 'Direct' : 'Walk-in')
                              : (locale === 'fr' ? 'Résa.' : 'Booking')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCheckout(room)}
                          disabled={updateStatus.isPending}
                          style={{
                            width: '100%', padding: '5px 8px', borderRadius: 7,
                            border: '1px solid #EDE8DF', background: '#FFFFFF',
                            color: '#5C6068', fontSize: 10, cursor: 'pointer',
                            fontWeight: 500, textAlign: 'center',
                          }}
                        >
                          {locale === 'fr' ? 'Libérer →' : 'Check out →'}
                        </button>
                      </>
                    ) : room.status === 'libre' ? (
                      <>
                        <div style={{ fontSize: 10, color: '#5C6068', marginBottom: 6 }}>
                          {ROOM_TYPE_LABELS[room.type]?.[locale] ?? room.type}
                          {' · '}{locale === 'fr' ? `Ét.${room.floor}` : `Fl.${room.floor}`}
                        </div>
                        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, fontWeight: 600, color: '#B5924C', marginBottom: 8 }}>
                          {formatAmount(room.basePrice, room.currency)}<span style={{ fontSize: 9, color: '#5C6068', fontWeight: 400 }}>/n</span>
                        </div>
                        <button
                          onClick={() => openWizard(room)}
                          style={{
                            width: '100%', padding: '6px 8px', borderRadius: 7,
                            border: 'none',
                            background: isSelected ? '#1A6B4A' : 'linear-gradient(135deg, #1A6B4A, #2D9D6A)',
                            color: '#FFFFFF', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                            textAlign: 'center',
                          }}
                        >
                          {locale === 'fr' ? 'Accueillir' : 'Check in'}
                        </button>
                      </>
                    ) : (
                      /* NETTOYAGE / TRAVAUX */
                      <>
                        <div style={{ fontSize: 10, color: '#5C6068', marginBottom: 8 }}>
                          {ROOM_TYPE_LABELS[room.type]?.[locale] ?? room.type}
                        </div>
                        <button
                          onClick={() => handleRoomStatusChange(room, 'libre')}
                          disabled={updateRoomStatus.isPending}
                          style={{
                            width: '100%', padding: '5px 8px', borderRadius: 7,
                            border: `1px solid ${cfg.border}`,
                            background: cfg.bg,
                            color: cfg.color, fontSize: 10, cursor: 'pointer',
                            fontWeight: 600, textAlign: 'center',
                          }}
                        >
                          {locale === 'fr' ? '→ Marquer libre' : '→ Mark available'}
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Walk-in list for selected date */}
          {walkInsDay.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, fontWeight: 400, color: '#3D1F0F', marginBottom: 12 }}>
                {locale === 'fr' ? 'Arrivées directes' : 'Walk-in arrivals'} — {formatStatDate(statsDate)}
              </h3>
              <div style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 14, overflow: 'hidden' }}>
                {walkInsDay.map((res, i) => (
                  <div key={res.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: i < walkInsDay.length - 1 ? '1px solid #FAF7F2' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <DoorOpen size={14} strokeWidth={1.5} color="#1A6B4A" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>
                          {res.guest ? `${res.guest.firstName} ${res.guest.lastName}` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#5C6068' }}>
                          {locale === 'fr' ? 'Ch.' : 'Rm.'} {res.room?.number ?? res.roomId}
                          {' · '}{res.checkIn.slice(0, 10)}
                          {' → '}{res.checkOut.slice(0, 10)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusBadge status={res.status} locale={locale} size="sm" />
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, fontWeight: 700, color: '#B5924C', whiteSpace: 'nowrap' }}>
                        {formatAmount(res.totalAmount, res.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard panel */}
        <div style={{ flexShrink: 0, width: 360 }}>
          {wizardRoom ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #EDE8DF',
              borderRadius: 20,
              padding: '22px',
              boxShadow: '0 4px 24px rgba(61,31,15,0.06)',
              position: 'sticky',
              top: 20,
            }}>
              {/* Wizard header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1A6B4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                    {locale === 'fr' ? 'Accueil direct' : 'Walk-in check-in'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontWeight: 400, color: '#3D1F0F' }}>
                    {locale === 'fr' ? 'Chambre' : 'Room'} {wizardRoom.number}
                  </div>
                  <div style={{ fontSize: 11, color: '#5C6068' }}>
                    {ROOM_TYPE_LABELS[wizardRoom.type]?.[locale] ?? wizardRoom.type}
                    {' · '}{formatAmount(wizardRoom.basePrice, wizardRoom.currency)}/n
                  </div>
                </div>
                <button
                  onClick={closeWizard}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: '1px solid #EDE8DF', background: '#FFFFFF',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C6068',
                  }}
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                {[
                  { n: 1, labelFr: 'Client',  labelEn: 'Guest' },
                  { n: 2, labelFr: 'Séjour',  labelEn: 'Stay' },
                ].map(({ n, labelFr, labelEn }, i) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: wizardStep > n ? '#1A6B4A' : wizardStep === n ? '#B5924C' : '#EDE8DF',
                        color: wizardStep >= n ? '#FFF' : '#5C6068',
                        fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                      }}>
                        {wizardStep > n ? <CheckCircle size={13} strokeWidth={2.5} /> : n}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: wizardStep === n ? 600 : 400, color: wizardStep === n ? '#3D1F0F' : '#5C6068' }}>
                        {locale === 'fr' ? labelFr : labelEn}
                      </span>
                    </div>
                    {i === 0 && (
                      <div style={{ width: 32, height: 1, background: wizardStep > 1 ? '#B5924C' : '#EDE8DF', margin: '0 10px', transition: 'background 0.3s' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1 — Guest */}
              {wizardStep === 1 && (
                <div>
                  {/* Mode toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {(['existing', 'new'] as const).map((mode) => {
                      const active = clientMode === mode
                      const Icon   = mode === 'existing' ? Users : UserPlus
                      const label  = mode === 'existing'
                        ? (locale === 'fr' ? 'Existant' : 'Existing')
                        : (locale === 'fr' ? 'Nouveau' : 'New guest')
                      return (
                        <button key={mode} type="button" onClick={() => switchClientMode(mode)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '8px', borderRadius: 8, cursor: 'pointer',
                            border: `1.5px solid ${active ? '#B5924C' : '#EDE8DF'}`,
                            background: active ? '#B5924C18' : '#FFFFFF',
                            color: active ? '#B5924C' : '#5C6068',
                            fontSize: 12, fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                          }}
                        >
                          <Icon size={13} strokeWidth={1.5} />
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {clientMode === 'existing' ? (
                    <Controller name="guestId" control={control} render={({ field }) => (
                      <NativeSelect
                        label={locale === 'fr' ? 'Sélectionner un client' : 'Select a guest'}
                        value={field.value ?? ''}
                        onChange={(e) => { field.onChange(e.target.value); setStep1Error('') }}
                      >
                        <option value="">{locale === 'fr' ? '-- Choisir' : '-- Choose'}</option>
                        {guests.map((g) => (
                          <option key={g.id} value={g.id}>{g.firstName} {g.lastName} · {g.phone}</option>
                        ))}
                      </NativeSelect>
                    )} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Controller name="newFirstName" control={control} render={({ field }) => (
                          <NativeInput {...field} label={locale === 'fr' ? 'Prénom' : 'First name'}
                            onChange={(e) => { field.onChange(e); setStep1Error('') }}
                            error={(errors as Record<string, { message?: string }>).newFirstName?.message} />
                        )} />
                        <Controller name="newLastName" control={control} render={({ field }) => (
                          <NativeInput {...field} label={locale === 'fr' ? 'Nom' : 'Last name'}
                            onChange={(e) => { field.onChange(e); setStep1Error('') }}
                            error={(errors as Record<string, { message?: string }>).newLastName?.message} />
                        )} />
                      </div>
                      <Controller name="newPhone" control={control} render={({ field }) => (
                        <NativeInput {...field} label="Téléphone" type="tel" placeholder="+225 07 00 00 00 00"
                          onChange={(e) => { field.onChange(e); setStep1Error('') }}
                          error={(errors as Record<string, { message?: string }>).newPhone?.message} />
                      )} />
                      <Controller name="newEmail" control={control} render={({ field }) => (
                        <NativeInput {...field} label={locale === 'fr' ? 'Email (opt.)' : 'Email (opt.)'} type="email"
                          error={(errors as Record<string, { message?: string }>).newEmail?.message} />
                      )} />
                    </div>
                  )}

                  {step1Error && <p style={{ marginTop: 10, fontSize: 12, color: '#8B1A2F' }}>{step1Error}</p>}
                </div>
              )}

              {/* Step 2 — Stay */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Stay type */}
                  <Controller name="stayType" control={control} render={({ field }) => (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
                        {locale === 'fr' ? 'Type de séjour' : 'Stay type'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                        {(['NUIT', 'PASSAGE'] as const).map((type) => {
                          const active = field.value === type
                          const Icon   = type === 'NUIT' ? Moon : Clock
                          return (
                            <button key={type} type="button" onClick={() => field.onChange(type)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px', borderRadius: 8, cursor: 'pointer',
                                border: `1.5px solid ${active ? '#B5924C' : '#EDE8DF'}`,
                                background: active ? '#B5924C18' : '#FFFFFF',
                                color: active ? '#B5924C' : '#5C6068',
                                fontSize: 12, fontWeight: active ? 600 : 400,
                              }}
                            >
                              <Icon size={12} strokeWidth={1.5} />
                              {type === 'NUIT' ? (locale === 'fr' ? 'Nuitée' : 'Overnight') : (locale === 'fr' ? 'Passage' : 'Short stay')}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )} />

                  {/* Dates */}
                  {stayType === 'NUIT' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Controller name="checkIn" control={control} render={({ field }) => (
                        <NativeInput {...field} type="date" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
                      )} />
                      <Controller name="checkOut" control={control} render={({ field }) => (
                        <NativeInput {...field} type="date" label={locale === 'fr' ? 'Départ' : 'Check-out'}
                          error={(errors as Record<string, { message?: string }>).checkOut?.message} />
                      )} />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Controller name="checkIn" control={control} render={({ field }) => (
                        <NativeInput {...field} type="datetime-local" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
                      )} />
                      <Controller name="durationHours" control={control} render={({ field }) => (
                        <NativeInput {...field} type="number" label={locale === 'fr' ? 'Durée (h)' : 'Duration (h)'}
                          error={(errors as Record<string, { message?: string }>).durationHours?.message} />
                      )} />
                    </div>
                  )}

                  {/* Currency */}
                  <Controller name="currency" control={control} render={({ field }) => (
                    <NativeSelect label={locale === 'fr' ? 'Devise' : 'Currency'} value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                      {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </NativeSelect>
                  )} />

                  {/* Services */}
                  {services.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
                        Services
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {services.map((svc) => {
                          const qty = serviceQtys[svc.id] ?? 0
                          return (
                            <div key={svc.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: qty > 0 ? '#FAF7F2' : '#FFFFFF',
                              border: `1px solid ${qty > 0 ? '#D4AF72' : '#EDE8DF'}`,
                              borderRadius: 8, padding: '6px 10px',
                            }}>
                              <div>
                                <span style={{ fontSize: 12, color: '#3D1F0F' }}>{svc.name}</span>
                                <span style={{ fontSize: 10, color: '#B5924C', marginLeft: 6, fontFamily: 'var(--font-dm-mono), monospace' }}>
                                  {formatAmount(svc.unitPrice, svc.currency)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {qty > 0 && <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: '#B5924C', minWidth: 14, textAlign: 'center' }}>{qty}</span>}
                                <button type="button" onClick={() => setQty(svc.id, -1)} disabled={qty === 0}
                                  style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid #EDE8DF', background: '#FFF', cursor: qty === 0 ? 'not-allowed' : 'pointer', opacity: qty === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Minus size={9} strokeWidth={2} />
                                </button>
                                <button type="button" onClick={() => setQty(svc.id, 1)}
                                  style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid #B5924C44', background: '#B5924C18', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B5924C' }}>
                                  <Plus size={9} strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price summary */}
                  {grandTotal > 0 && (
                    <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#5C6068' }}>
                      {stayType === 'NUIT' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{nights}n × {formatAmount(wizardRoom.basePrice, wizardRoom.currency)}</span>
                          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(roomTotal, currency)}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{durationHours}h</span>
                          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(roomTotal, currency)}</span>
                        </div>
                      )}
                      {servicesTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                          <span>Services</span>
                          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(servicesTotal, currency)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid #EDE8DF', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: '#3D1F0F' }}>Total</span>
                        <strong style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#B5924C', fontSize: 14 }}>
                          {formatAmount(grandTotal, currency)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: wizardStep === 1 ? 'flex-end' : 'space-between',
                marginTop: 18,
                paddingTop: 14,
                borderTop: '1px solid #EDE8DF',
              }}>
                {wizardStep === 2 && (
                  <button type="button"
                    onClick={() => setWizardStep(1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid #EDE8DF', background: '#FFFFFF',
                      color: '#5C6068', fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    <ChevronLeft size={13} strokeWidth={2} />
                    {locale === 'fr' ? 'Retour' : 'Back'}
                  </button>
                )}

                {wizardStep === 1 ? (
                  <button type="button"
                    onClick={() => { if (canAdvanceStep1()) setWizardStep(2) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 20px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
                      color: '#FAF7F2', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(181,146,76,0.2)',
                    }}
                  >
                    {locale === 'fr' ? 'Suivant' : 'Next'}
                    <ChevronRight size={13} strokeWidth={2} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || createReservation.isPending || updateStatus.isPending}
                    onClick={handleSubmit(onSubmit)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '10px 20px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #1A6B4A, #2D9D6A)',
                      color: '#FFFFFF', fontSize: 13, fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      boxShadow: '0 2px 14px rgba(26,107,74,0.3)',
                    }}
                  >
                    <DoorOpen size={15} strokeWidth={1.5} />
                    {isSubmitting
                      ? (locale === 'fr' ? 'Enregistrement…' : 'Checking in…')
                      : (locale === 'fr' ? 'Accueillir maintenant' : 'Check in now')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div style={{
              background: '#FAF7F2',
              border: '1px dashed #EDE8DF',
              borderRadius: 20,
              padding: '40px 24px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', gap: 14,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: '#1A6B4A18', border: '1px solid #1A6B4A30',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DoorOpen size={22} strokeWidth={1.25} color="#1A6B4A" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#3D1F0F', marginBottom: 6 }}>
                  {locale === 'fr' ? 'Accueil direct' : 'Walk-in check-in'}
                </p>
                <p style={{ fontSize: 12, color: '#5C6068', lineHeight: 1.6 }}>
                  {locale === 'fr'
                    ? 'Cliquez sur une chambre libre pour enregistrer un client en accueil direct.'
                    : 'Click on an available room to check in a walk-in guest.'}
                </p>
              </div>
              {freeRooms.length > 0 ? (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#1A6B4A',
                  background: '#E8F5F0', padding: '6px 16px', borderRadius: 99,
                }}>
                  {freeRooms.length} {locale === 'fr' ? 'chambre(s) disponible(s)' : 'room(s) available'}
                </div>
              ) : (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#8B1A2F',
                  background: '#FEF2F2', padding: '6px 16px', borderRadius: 99,
                }}>
                  {locale === 'fr' ? 'Aucune chambre libre' : 'No rooms available'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
