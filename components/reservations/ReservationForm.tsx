// components/reservations/ReservationForm.tsx
'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useGuests, useCreateGuest } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { useServices } from '@/lib/queries/services'
import { useCreateReservation, useReservations } from '@/lib/queries/reservations'
import { ApiError } from '@/lib/api/client'
import { getNights, formatAmount, CURRENCY_OPTIONS } from '@/lib/utils/format'
import type { Currency } from '@/lib/utils/format'
import { CheckCircle, Plus, Minus, Moon, Clock, UserPlus, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const existingGuestSchema = z.object({
  clientMode:    z.literal('existing'),
  stayType:      z.enum(['NUIT', 'PASSAGE']),
  guestId:       z.string().min(1, 'Requis'),
  roomId:        z.string().min(1, 'Requis'),
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
  roomId:        z.string().min(1, 'Requis'),
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

interface Props { onClose: () => void }

export function ReservationForm({ onClose }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: guests = [] } = useGuests()
  const { data: rooms  = [] } = useRooms()
  const { data: services = [] } = useServices()
  const { data: activeReservations = [] } = useReservations({ active: true })
  const createReservation = useCreateReservation()
  const createGuest = useCreateGuest()

  const [serviceQtys, setServiceQtys] = useState<Record<string, number>>({})
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')

  // Rooms blocked by active (CONFIRMEE/CHECKIN) reservations
  const bookedRoomIds = new Set(activeReservations.map((r) => r.roomId))
  const freeRooms = rooms.filter((r) => r.status === 'libre' && !bookedRoomIds.has(r.id))
  // Rooms that are "libre" but have a pending booking — show as info
  const pendingRooms = rooms.filter((r) => r.status === 'libre' && bookedRoomIds.has(r.id))

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientMode: 'existing', stayType: 'NUIT', currency: 'FCFA' as Currency },
  })

  const stayType          = watch('stayType')
  const checkIn           = watch('checkIn')
  const checkOut          = watch('checkOut')
  const roomId            = watch('roomId')
  const currency          = watch('currency') as Currency
  const durationHoursRaw  = watch('durationHours')
  const durationHours     = durationHoursRaw ? parseInt(String(durationHoursRaw), 10) : 0

  const nights = stayType === 'NUIT' && checkIn && checkOut ? getNights(checkIn, checkOut) : 0
  const selectedRoom = rooms.find((r) => r.id === roomId)

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

  const switchMode = (mode: 'existing' | 'new') => {
    setClientMode(mode)
    setValue('clientMode', mode)
    setValue('guestId', '')
  }

  const onSubmit = async (data: FormData) => {
    try {
      let resolvedGuestId: string = data.clientMode === 'existing' ? (data.guestId ?? '') : ''

      if (data.clientMode === 'new') {
        const newGuest = await createGuest.mutateAsync({
          firstName: data.newFirstName!,
          lastName:  data.newLastName!,
          phone:     data.newPhone!,
          ...(data.newEmail ? { email: data.newEmail } : {}),
        })
        resolvedGuestId = newGuest.id
      }

      const selectedServices = Object.entries(serviceQtys).map(([serviceId, quantity]) => ({ serviceId, quantity }))
      await createReservation.mutateAsync({
        guestId:      resolvedGuestId,
        roomId:       data.roomId,
        checkIn:      data.checkIn,
        ...(data.stayType === 'NUIT' ? { checkOut: data.checkOut! } : {}),
        stayType:     data.stayType,
        durationHours: data.stayType === 'PASSAGE' ? parseInt(String(data.durationHours!), 10) : undefined,
        totalAmount:  grandTotal > 0 ? grandTotal : undefined,
        currency:     data.currency,
        services:     selectedServices.length > 0 ? selectedServices : undefined,
      })
      toast.success(locale === 'fr' ? 'Réservation créée !' : 'Reservation created!')
      onClose()
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur lors de la création' : 'Failed to create reservation')
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              const label = type === 'NUIT' ? (locale === 'fr' ? 'Nuitée' : 'Overnight') : (locale === 'fr' ? 'Passage' : 'Short stay')
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

      {/* Client mode toggle */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {locale === 'fr' ? 'Client' : 'Guest'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {(['existing', 'new'] as const).map((mode) => {
            const active = clientMode === mode
            const Icon = mode === 'existing' ? Users : UserPlus
            const label = mode === 'existing'
              ? (locale === 'fr' ? 'Client existant' : 'Existing guest')
              : (locale === 'fr' ? 'Nouveau client' : 'New guest')
            return (
              <button key={mode} type="button" onClick={() => switchMode(mode)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${active ? '#B5924C' : '#EDE8DF'}`,
                  background: active ? '#B5924C18' : '#FFFFFF',
                  color: active ? '#B5924C' : '#5C6068',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
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
            <NativeSelect label="" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} error={(errors as Record<string, { message?: string }>).guestId?.message}>
              <option value="">{locale === 'fr' ? '-- Sélectionner un client' : '-- Select a guest'}</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>{g.firstName} {g.lastName}</option>
              ))}
            </NativeSelect>
          )} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px', background: '#FAF7F2', borderRadius: 12, border: '1px solid #EDE8DF' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Controller name="newFirstName" control={control} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Prénom' : 'First name'}
                  error={(errors as Record<string, { message?: string }>).newFirstName?.message} />
              )} />
              <Controller name="newLastName" control={control} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Nom' : 'Last name'}
                  error={(errors as Record<string, { message?: string }>).newLastName?.message} />
              )} />
            </div>
            <Controller name="newPhone" control={control} render={({ field }) => (
              <NativeInput {...field} label={locale === 'fr' ? 'Téléphone' : 'Phone'} type="tel"
                placeholder="+225 07 00 00 00 00"
                error={(errors as Record<string, { message?: string }>).newPhone?.message} />
            )} />
            <Controller name="newEmail" control={control} render={({ field }) => (
              <NativeInput {...field} label={locale === 'fr' ? 'Email (optionnel)' : 'Email (optional)'} type="email"
                error={(errors as Record<string, { message?: string }>).newEmail?.message} />
            )} />
          </div>
        )}
      </div>

      {/* Room */}
      <div>
        <Controller name="roomId" control={control} render={({ field }) => (
          <NativeSelect label={locale === 'fr' ? 'Chambre' : 'Room'} value={field.value} onChange={(e) => field.onChange(e.target.value)} error={errors.roomId?.message}>
            <option value="">--</option>
            {freeRooms.map((r) => (
              <option key={r.id} value={r.id}>{r.number} — {r.type} ({formatAmount(r.basePrice, r.currency)}/n)</option>
            ))}
            {pendingRooms.length > 0 && (
              <optgroup label={locale === 'fr' ? '⚠ Réservées (non disponibles)' : '⚠ Reserved (unavailable)'}>
                {pendingRooms.map((r) => (
                  <option key={r.id} value={r.id} disabled>{r.number} — {r.type} · Réservée</option>
                ))}
              </optgroup>
            )}
          </NativeSelect>
        )} />
      </div>

      {/* Dates */}
      {stayType === 'NUIT' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller name="checkIn" control={control} render={({ field }) => (
            <NativeInput {...field} type="date" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
          )} />
          <Controller name="checkOut" control={control} render={({ field }) => (
            <NativeInput {...field} type="date" label={locale === 'fr' ? 'Départ' : 'Check-out'} error={errors.checkOut?.message} />
          )} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller name="checkIn" control={control} render={({ field }) => (
            <NativeInput {...field} type="datetime-local" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={errors.checkIn?.message} />
          )} />
          <Controller name="durationHours" control={control} render={({ field }) => (
            <NativeInput {...field} type="number" label={locale === 'fr' ? 'Durée (heures)' : 'Duration (hours)'} error={errors.durationHours?.message} />
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
                <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: qty > 0 ? '#FAF7F2' : '#FFFFFF', border: `1px solid ${qty > 0 ? '#D4AF72' : '#EDE8DF'}`, borderRadius: 8, padding: '7px 12px', transition: 'all 0.15s' }}>
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

      {/* Total preview */}
      {grandTotal > 0 && (
        <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#5C6068' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {stayType === 'NUIT' ? (
              <span>{nights}n × {formatAmount(selectedRoom?.basePrice ?? 0, selectedRoom?.currency ?? 'FCFA')}</span>
            ) : (
              <span>{durationHours}h × {formatAmount(selectedRoom?.basePrice ?? 0, selectedRoom?.currency ?? 'FCFA')}/24h</span>
            )}
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(roomTotal, currency)}</span>
          </div>
          {servicesTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span>Services</span>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>{formatAmount(servicesTotal, currency)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #EDE8DF', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <strong style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#B5924C', fontSize: 15 }}>
              {formatAmount(grandTotal, currency)}
            </strong>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '9px 20px', fontSize: 13, color: '#5C6068', cursor: 'pointer' }}>
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
            color: '#FAF7F2', border: 'none', borderRadius: 10,
            padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <CheckCircle size={14} strokeWidth={1.5} />
          {isSubmitting ? '…' : (locale === 'fr' ? 'Créer la réservation' : 'Create reservation')}
        </button>
      </div>
    </form>
  )
}
