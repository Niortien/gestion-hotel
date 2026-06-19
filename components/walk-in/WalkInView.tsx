// components/walk-in/WalkInView.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useGuests, useCreateGuest } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { useServices } from '@/lib/queries/services'
import { useCreateReservation, useUpdateReservationStatus } from '@/lib/queries/reservations'
import { ApiError } from '@/lib/api/client'
import { getNights, formatAmount, CURRENCY_OPTIONS } from '@/lib/utils/format'
import type { Currency } from '@/lib/utils/format'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import {
  Moon, Clock, UserPlus, Users, Plus, Minus,
  ChevronRight, ChevronLeft, DoorOpen, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Zod schema (même structure que ReservationForm) ─────────────────────────

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

// ─── Room type labels ─────────────────────────────────────────────────────────

const ROOM_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  standard: { fr: 'Standard',  en: 'Standard' },
  deluxe:   { fr: 'Deluxe',    en: 'Deluxe' },
  suite:    { fr: 'Suite',     en: 'Suite' },
  prestige: { fr: 'Prestige',  en: 'Prestige' },
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { n: 1 as const, labelFr: 'Chambre', labelEn: 'Room' },
  { n: 2 as const, labelFr: 'Client',  labelEn: 'Guest' },
  { n: 3 as const, labelFr: 'Séjour',  labelEn: 'Stay' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function WalkInView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')
  const [serviceQtys, setServiceQtys] = useState<Record<string, number>>({})
  const [step2Error, setStep2Error] = useState<string>('')

  const { data: rooms = [] }    = useRooms()
  const { data: guests = [] }   = useGuests()
  const { data: services = [] } = useServices()
  const createReservation = useCreateReservation()
  const createGuest       = useCreateGuest()
  const updateStatus      = useUpdateReservationStatus()

  const freeRooms = rooms.filter((r) => r.status === 'libre')

  const today = new Date().toISOString().slice(0, 10)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    reset,
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

  const nights = stayType === 'NUIT' && checkIn && checkOut ? getNights(checkIn, checkOut) : 0
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  const roomTotal = selectedRoom
    ? stayType === 'NUIT'
      ? selectedRoom.basePrice * Math.max(nights, 0)
      : selectedRoom.basePrice * (Math.max(durationHours, 0) / 24)
    : 0
  const servicesTotal = Object.entries(serviceQtys).reduce((acc, [sId, qty]) => {
    const svc = services.find((s) => s.id === sId)
    return acc + (svc ? svc.unitPrice * qty : 0)
  }, 0)
  const grandTotal = roomTotal + servicesTotal

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
    setStep2Error('')
  }

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  // Step 2 validation before advancing
  const canAdvanceStep2 = () => {
    if (clientMode === 'existing') {
      if (!guestId) { setStep2Error(locale === 'fr' ? 'Sélectionnez un client' : 'Select a guest'); return false }
    } else {
      if (!newFirstName?.trim() || !newLastName?.trim() || !newPhone?.trim()) {
        setStep2Error(locale === 'fr' ? 'Prénom, nom et téléphone sont requis' : 'First name, last name and phone are required')
        return false
      }
    }
    setStep2Error('')
    return true
  }

  const resetWizard = () => {
    setStep(1)
    setSelectedRoomId('')
    setClientMode('existing')
    setServiceQtys({})
    setStep2Error('')
    reset({ clientMode: 'existing', stayType: 'NUIT', currency: 'FCFA' as Currency, checkIn: today })
  }

  const onSubmit = async (data: FormData) => {
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
        roomId:        selectedRoomId,
        checkIn:       data.checkIn,
        ...(data.stayType === 'NUIT' ? { checkOut: data.checkOut! } : {}),
        stayType:      data.stayType,
        durationHours: data.stayType === 'PASSAGE' ? parseInt(String(data.durationHours!), 10) : undefined,
        totalAmount:   grandTotal > 0 ? grandTotal : undefined,
        currency:      data.currency,
        services:      selectedServices.length > 0 ? selectedServices : undefined,
      })

      // Immediate check-in → room becomes OCCUPEE
      await updateStatus.mutateAsync({ id: res.id, status: 'checkin' })

      toast.success(locale === 'fr' ? 'Client enregistré — Chambre assignée !' : 'Guest checked in — Room assigned!')
      resetWizard()
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur lors de l\'enregistrement' : 'Check-in failed')
      toast.error(msg)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={pageRef} style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div data-animate style={{ marginBottom: 32 }}>
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
            <h1 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 42, fontWeight: 300, color: '#3D1F0F',
              letterSpacing: '-0.01em', lineHeight: 1.1,
            }}>
              {locale === 'fr' ? 'Accueil immédiat' : 'Walk-in'}
            </h1>
            <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
              {locale === 'fr'
                ? 'Enregistrez un client présent à la réception en 3 étapes'
                : 'Check in a walk-in guest in 3 steps'}
            </p>
          </div>
        </div>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Step indicator */}
      <div data-animate style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {STEPS.map(({ n, labelFr, labelEn }, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > n ? '#1A6B4A' : step === n ? '#B5924C' : '#EDE8DF',
                color: step >= n ? '#FFF' : '#5C6068',
                fontSize: 13, fontWeight: 700,
                transition: 'all 0.2s',
              }}>
                {step > n ? <CheckCircle size={15} strokeWidth={2.5} /> : n}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: step === n ? 600 : 400,
                color: step === n ? '#3D1F0F' : step > n ? '#1A6B4A' : '#5C6068',
              }}>
                {locale === 'fr' ? labelFr : labelEn}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 60, height: 2,
                background: step > n ? '#1A6B4A' : '#EDE8DF',
                margin: '0 16px',
                borderRadius: 2,
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Content card */}
      <div data-animate style={{
        background: '#FFFFFF',
        border: '1px solid #EDE8DF',
        borderRadius: 20,
        padding: '32px 36px',
        boxShadow: '0 2px 20px rgba(61,31,15,0.04)',
      }}>

        {/* ── STEP 1 — Room selection ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F', marginBottom: 6 }}>
                {locale === 'fr' ? 'Choisir une chambre' : 'Select a room'}
              </h2>
              <p style={{ fontSize: 13, color: '#5C6068' }}>
                {locale === 'fr'
                  ? `${freeRooms.length} chambre${freeRooms.length !== 1 ? 's' : ''} disponible${freeRooms.length !== 1 ? 's' : ''}`
                  : `${freeRooms.length} room${freeRooms.length !== 1 ? 's' : ''} available`}
              </p>
            </div>

            {freeRooms.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: '#FAF7F2', borderRadius: 16,
                border: '1px dashed #EDE8DF',
              }}>
                <DoorOpen size={36} strokeWidth={1} color="#B5924C" style={{ marginBottom: 12 }} />
                <p style={{ color: '#5C6068', fontSize: 14 }}>
                  {locale === 'fr' ? 'Aucune chambre libre en ce moment' : 'No rooms available right now'}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12,
              }}>
                {freeRooms.map((room) => {
                  const isSelected = selectedRoomId === room.id
                  const typeLabel = ROOM_TYPE_LABELS[room.type]?.[locale] ?? room.type
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 14,
                        border: `2px solid ${isSelected ? '#B5924C' : '#EDE8DF'}`,
                        background: isSelected ? '#B5924C10' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        boxShadow: isSelected ? '0 4px 16px rgba(181,146,76,0.15)' : '0 1px 4px rgba(61,31,15,0.04)',
                      }}
                    >
                      <div style={{ marginBottom: 10 }}>
                        <span style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: 26, fontWeight: 700,
                          color: isSelected ? '#B5924C' : '#3D1F0F',
                          lineHeight: 1,
                        }}>
                          {room.number}
                        </span>
                        {isSelected && (
                          <span style={{
                            display: 'inline-flex', marginLeft: 6, verticalAlign: 'middle',
                          }}>
                            <CheckCircle size={16} strokeWidth={2} color="#B5924C" />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 4 }}>
                        {typeLabel} · {locale === 'fr' ? `Étage ${room.floor}` : `Floor ${room.floor}`}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: 13, fontWeight: 600,
                        color: '#B5924C',
                      }}>
                        {formatAmount(room.basePrice, room.currency)}<span style={{ fontSize: 10, fontWeight: 400, color: '#5C6068' }}>/n</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Guest ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F', marginBottom: 20 }}>
              {locale === 'fr' ? 'Informations client' : 'Guest information'}
            </h2>

            {/* Mode toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, maxWidth: 400 }}>
              {(['existing', 'new'] as const).map((mode) => {
                const active = clientMode === mode
                const Icon = mode === 'existing' ? Users : UserPlus
                const label = mode === 'existing'
                  ? (locale === 'fr' ? 'Client existant' : 'Existing guest')
                  : (locale === 'fr' ? 'Nouveau client' : 'New guest')
                return (
                  <button key={mode} type="button" onClick={() => switchClientMode(mode)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${active ? '#B5924C' : '#EDE8DF'}`,
                      background: active ? '#B5924C18' : '#FFFFFF',
                      color: active ? '#B5924C' : '#5C6068',
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    {label}
                  </button>
                )
              })}
            </div>

            {clientMode === 'existing' ? (
              <div style={{ maxWidth: 400 }}>
                <Controller name="guestId" control={control} render={({ field }) => (
                  <NativeSelect
                    label={locale === 'fr' ? 'Sélectionner un client' : 'Select a guest'}
                    value={field.value ?? ''}
                    onChange={(e) => { field.onChange(e.target.value); setStep2Error('') }}
                  >
                    <option value="">{locale === 'fr' ? '-- Choisir un client' : '-- Choose a guest'}</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>{g.firstName} {g.lastName} · {g.phone}</option>
                    ))}
                  </NativeSelect>
                )} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Controller name="newFirstName" control={control} render={({ field }) => (
                    <NativeInput {...field} label={locale === 'fr' ? 'Prénom' : 'First name'}
                      onChange={(e) => { field.onChange(e); setStep2Error('') }}
                      error={(errors as Record<string, { message?: string }>).newFirstName?.message} />
                  )} />
                  <Controller name="newLastName" control={control} render={({ field }) => (
                    <NativeInput {...field} label={locale === 'fr' ? 'Nom' : 'Last name'}
                      onChange={(e) => { field.onChange(e); setStep2Error('') }}
                      error={(errors as Record<string, { message?: string }>).newLastName?.message} />
                  )} />
                </div>
                <Controller name="newPhone" control={control} render={({ field }) => (
                  <NativeInput {...field} label={locale === 'fr' ? 'Téléphone' : 'Phone'} type="tel"
                    placeholder="+225 07 00 00 00 00"
                    onChange={(e) => { field.onChange(e); setStep2Error('') }}
                    error={(errors as Record<string, { message?: string }>).newPhone?.message} />
                )} />
                <Controller name="newEmail" control={control} render={({ field }) => (
                  <NativeInput {...field} label={locale === 'fr' ? 'Email (optionnel)' : 'Email (optional)'} type="email"
                    error={(errors as Record<string, { message?: string }>).newEmail?.message} />
                )} />
              </div>
            )}

            {step2Error && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#8B1A2F' }}>{step2Error}</p>
            )}
          </div>
        )}

        {/* ── STEP 3 — Stay details ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F', marginBottom: 20 }}>
              {locale === 'fr' ? 'Détails du séjour' : 'Stay details'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>

              {/* Selected room summary */}
              {selectedRoom && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: '#FAF7F2', border: '1px solid #EDE8DF',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color: '#3D1F0F' }}>
                      {locale === 'fr' ? 'Chambre' : 'Room'} {selectedRoom.number}
                    </span>
                    <span style={{ fontSize: 12, color: '#5C6068', marginLeft: 10 }}>
                      {ROOM_TYPE_LABELS[selectedRoom.type]?.[locale] ?? selectedRoom.type} · {locale === 'fr' ? `Étage ${selectedRoom.floor}` : `Floor ${selectedRoom.floor}`}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 14, fontWeight: 600, color: '#B5924C' }}>
                    {formatAmount(selectedRoom.basePrice, selectedRoom.currency)}/n
                  </span>
                </div>
              )}

              {/* Stay type toggle */}
              <Controller name="stayType" control={control} render={({ field }) => (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    {locale === 'fr' ? 'Type de séjour' : 'Stay type'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['NUIT', 'PASSAGE'] as const).map((type) => {
                      const active = field.value === type
                      const Icon = type === 'NUIT' ? Moon : Clock
                      const label = type === 'NUIT'
                        ? (locale === 'fr' ? 'Nuitée' : 'Overnight')
                        : (locale === 'fr' ? 'Passage' : 'Short stay')
                      return (
                        <button key={type} type="button" onClick={() => field.onChange(type)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                            border: `1.5px solid ${active ? '#B5924C' : '#EDE8DF'}`,
                            background: active ? '#B5924C18' : '#FFFFFF',
                            color: active ? '#B5924C' : '#5C6068',
                            fontSize: 13, fontWeight: active ? 600 : 400,
                            transition: 'all 0.15s',
                          }}
                        >
                          <Icon size={13} strokeWidth={1.5} />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )} />

              {/* Dates */}
              {stayType === 'NUIT' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Controller name="checkIn" control={control} render={({ field }) => (
                    <NativeInput {...field} type="date" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
                  )} />
                  <Controller name="checkOut" control={control} render={({ field }) => (
                    <NativeInput {...field} type="date" label={locale === 'fr' ? 'Départ' : 'Check-out'}
                      error={(errors as Record<string, { message?: string }>).checkOut?.message} />
                  )} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Controller name="checkIn" control={control} render={({ field }) => (
                    <NativeInput {...field} type="datetime-local" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
                  )} />
                  <Controller name="durationHours" control={control} render={({ field }) => (
                    <NativeInput {...field} type="number" label={locale === 'fr' ? 'Durée (heures)' : 'Duration (hours)'}
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
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Services
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {services.map((svc) => {
                      const qty = serviceQtys[svc.id] ?? 0
                      return (
                        <div key={svc.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: qty > 0 ? '#FAF7F2' : '#FFFFFF',
                          border: `1px solid ${qty > 0 ? '#D4AF72' : '#EDE8DF'}`,
                          borderRadius: 8, padding: '7px 12px', transition: 'all 0.15s',
                        }}>
                          <div>
                            <span style={{ fontSize: 13, color: '#3D1F0F' }}>{svc.name}</span>
                            <span style={{ fontSize: 11, color: '#B5924C', marginLeft: 8, fontFamily: 'var(--font-dm-mono), monospace' }}>
                              {formatAmount(svc.unitPrice, svc.currency)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {qty > 0 && (
                              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#B5924C', minWidth: 16, textAlign: 'center' }}>{qty}</span>
                            )}
                            <button type="button" onClick={() => setQty(svc.id, -1)} disabled={qty === 0}
                              style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #EDE8DF', background: '#FFF', cursor: qty === 0 ? 'not-allowed' : 'pointer', opacity: qty === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C6068' }}>
                              <Minus size={10} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => setQty(svc.id, 1)}
                              style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #B5924C44', background: '#B5924C18', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B5924C' }}>
                              <Plus size={10} strokeWidth={2} />
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
                <div style={{
                  background: '#FAF7F2', border: '1px solid #EDE8DF',
                  borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#5C6068',
                }}>
                  {stayType === 'NUIT' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{nights}n × {formatAmount(selectedRoom?.basePrice ?? 0, selectedRoom?.currency ?? 'FCFA')}</span>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(roomTotal, currency)}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{durationHours}h × {formatAmount(selectedRoom?.basePrice ?? 0, selectedRoom?.currency ?? 'FCFA')}/24h</span>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(roomTotal, currency)}</span>
                    </div>
                  )}
                  {servicesTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span>Services</span>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(servicesTotal, currency)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #EDE8DF', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#3D1F0F' }}>Total</span>
                    <strong style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#B5924C', fontSize: 16 }}>
                      {formatAmount(grandTotal, currency)}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* ── Navigation buttons ── */}
        <div style={{
          display: 'flex',
          justifyContent: step === 1 ? 'flex-end' : 'space-between',
          alignItems: 'center',
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid #EDE8DF',
        }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                border: '1px solid #EDE8DF', background: '#FFFFFF',
                color: '#5C6068', fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <ChevronLeft size={14} strokeWidth={2} />
              {locale === 'fr' ? 'Retour' : 'Back'}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !selectedRoomId}
              onClick={() => {
                if (step === 1) {
                  setStep(2)
                } else if (step === 2) {
                  if (canAdvanceStep2()) setStep(3)
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 24px', borderRadius: 10,
                border: 'none',
                background: (step === 1 && !selectedRoomId)
                  ? '#EDE8DF'
                  : 'linear-gradient(135deg, #B5924C, #D4AF72)',
                color: (step === 1 && !selectedRoomId) ? '#5C6068' : '#FAF7F2',
                fontSize: 13, fontWeight: 600,
                cursor: (step === 1 && !selectedRoomId) ? 'not-allowed' : 'pointer',
                boxShadow: (step === 1 && !selectedRoomId) ? 'none' : '0 2px 12px rgba(181,146,76,0.25)',
                transition: 'all 0.15s',
              }}
            >
              {locale === 'fr' ? 'Suivant' : 'Next'}
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || createReservation.isPending || updateStatus.isPending}
              onClick={handleSubmit(onSubmit)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #1A6B4A, #2D9D6A)',
                color: '#FFFFFF',
                fontSize: 14, fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 16px rgba(26,107,74,0.3)',
                transition: 'all 0.15s',
              }}
            >
              <DoorOpen size={16} strokeWidth={1.5} />
              {isSubmitting
                ? (locale === 'fr' ? 'Enregistrement…' : 'Checking in…')
                : (locale === 'fr' ? 'Accueillir maintenant' : 'Check in now')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
