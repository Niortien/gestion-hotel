// components/clients/CheckInForm.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { gsap } from '@/lib/animations/gsap.config'
import { animateFormStep } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useCreateGuest } from '@/lib/queries/guests'
import { useCreateReservation } from '@/lib/queries/reservations'
import { useRooms } from '@/lib/queries/rooms'
import { ApiError } from '@/lib/api/client'
import { SERVICES } from '@/lib/data/hotel'
import { getNights, formatAmount } from '@/lib/utils/format'
import toast from 'react-hot-toast'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import type { ServiceItem } from '@/types/hotel'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName:  z.string().min(2, 'Minimum 2 caractères'),
  email:     z.string().email('Email invalide'),
  phone:     z.string().min(10, 'Téléphone invalide (min 10 chiffres)'),
})

const step2Schema = z.object({
  roomId:   z.string().min(1, 'Sélectionnez une chambre'),
  checkIn:  z.string().min(1, 'Date requise'),
  checkOut: z.string().min(1, 'Date requise'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

interface ServicesData { services: Record<string, number> }

// ─── Field error component ─────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (ref.current && message) {
      gsap.fromTo(ref.current, { x: -6, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25 })
    }
  }, [message])
  if (!message) return null
  return (
    <span ref={ref} style={{ fontSize: 11, color: '#8B1A2F', marginTop: 3, display: 'block' }}>
      {message}
    </span>
  )
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            width: i === current ? 32 : 16,
            borderRadius: 99,
            background: i <= current ? '#B5924C' : '#EDE8DF',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

export function CheckInForm({ onClose }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: allRooms = [] } = useRooms()
  const createGuestMutation = useCreateGuest()
  const createReservationMutation = useCreateReservation()

  const [step, setStep] = useState(0)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [serviceQtys, setServiceQtys] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const stepRef = useRef<HTMLDivElement>(null)
  const prevStepRef = useRef<HTMLDivElement>(null)

  const freeRooms = allRooms.filter((r) => r.status === 'libre')

  // ─── Step 1 form ─────────────────────────────────────────────────
  const {
    control: c1,
    handleSubmit: hs1,
    formState: { errors: e1 },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  // ─── Step 2 form ─────────────────────────────────────────────────
  const {
    control: c2,
    handleSubmit: hs2,
    watch: w2,
    formState: { errors: e2 },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const checkInVal  = w2('checkIn')
  const checkOutVal = w2('checkOut')
  const roomIdVal   = w2('roomId')
  const nights = checkInVal && checkOutVal ? getNights(checkInVal, checkOutVal) : 0
  const selectedRoom = allRooms.find((r) => r.id === roomIdVal)

  // Total
  const servicesTotal = Object.entries(serviceQtys).reduce((acc, [sId, qty]) => {
    const svc = SERVICES.find((s) => s.id === sId)
    return acc + (svc ? svc.unitPrice * qty : 0)
  }, 0)
  const roomTotal = selectedRoom ? selectedRoom.basePrice * Math.max(nights, 0) : 0
  const grandTotal = roomTotal + servicesTotal

  const handleNext1 = hs1((data) => {
    setStep1Data(data)
    setStep(1)
  })

  const handleNext2 = hs2((data) => {
    setStep2Data(data)
    setStep(2)
  })

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) return
    setSubmitting(true)
    try {
      const guest = await createGuestMutation.mutateAsync({
        firstName: step1Data.firstName,
        lastName:  step1Data.lastName,
        email:     step1Data.email,
        phone:     step1Data.phone,
      })

      await createReservationMutation.mutateAsync({
        guestId:     guest.id,
        roomId:      step2Data.roomId,
        checkIn:     step2Data.checkIn,
        checkOut:    step2Data.checkOut,
        totalAmount: grandTotal,
      })

      setSubmitting(false)
      setDone(true)
      toast.success(locale === 'fr' ? 'Check-in confirmé !' : 'Check-in confirmed!')
    } catch (err) {
      setSubmitting(false)
      if (err instanceof ApiError && err.status === 409) {
        const msg = locale === 'fr' ? 'Cet email est déjà utilisé par un client existant.' : 'This email is already in use.'
        setEmailError(msg)
        setStep(0)
        toast.error(msg)
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[CheckIn error]', err)
        toast.error(msg || (locale === 'fr' ? 'Erreur lors du check-in' : 'Check-in failed'))
      }
    }
  }

  const inputStyle = {
    background: '#FFFFFF',
    border: '1px solid #EDE8DF',
    borderRadius: 10,
    fontSize: 13,
    color: '#3D1F0F',
  }

  if (done) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1A6B4A18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={28} strokeWidth={1.25} style={{ color: '#1A6B4A' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, color: '#3D1F0F', marginBottom: 8 }}>
          {locale === 'fr' ? 'Check-in confirmé !' : 'Check-in confirmed!'}
        </h3>
        <p style={{ fontSize: 13, color: '#5C6068', marginBottom: 24 }}>
          {locale === 'fr' ? 'La réservation a été enregistrée.' : 'The reservation has been recorded.'}
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
            color: '#FAF7F2',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {locale === 'fr' ? 'Fermer' : 'Close'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', minWidth: 480 }}>
      <StepIndicator current={step} total={4} />

      {/* Step 0 — Identity */}
      {step === 0 && (
        <form onSubmit={handleNext1}>
          <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, color: '#3D1F0F', marginBottom: 20 }}>
            {locale === 'fr' ? 'Identité du client' : 'Guest identity'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Controller name="firstName" control={c1} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Prénom' : 'First name'} error={e1.firstName?.message} />
              )} />
            </div>
            <div>
              <Controller name="lastName" control={c1} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Nom' : 'Last name'} error={e1.lastName?.message} />
              )} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Controller name="email" control={c1} render={({ field }) => (
                <NativeInput
                  {...field}
                  type="email"
                  label="Email"
                  error={e1.email?.message ?? emailError ?? undefined}
                  onChange={(e) => { setEmailError(null); field.onChange(e) }}
                />
              )} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Controller name="phone" control={c1} render={({ field }) => (
                <NativeInput {...field} type="tel" label={locale === 'fr' ? 'Téléphone' : 'Phone'} error={e1.phone?.message} />
              )} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {locale === 'fr' ? 'Suivant' : 'Next'} <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      )}

      {/* Step 1 — Stay */}
      {step === 1 && (
        <form onSubmit={handleNext2}>
          <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, color: '#3D1F0F', marginBottom: 20 }}>
            {locale === 'fr' ? 'Détails du séjour' : 'Stay details'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Controller name="roomId" control={c2} render={({ field }) => (
                <NativeSelect label={locale === 'fr' ? 'Chambre' : 'Room'} value={field.value} onChange={(e) => field.onChange(e.target.value)} error={e2.roomId?.message}>
                  <option value="">--</option>
                  {freeRooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.number} — {r.type} ({formatAmount(r.basePrice, r.currency)}/nuit)</option>
                  ))}
                </NativeSelect>
              )} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Controller name="checkIn" control={c2} render={({ field }) => (
                  <NativeInput {...field} type="date" label={locale === 'fr' ? 'Arrivée' : 'Check-in'} error={e2.checkIn?.message} />
                )} />
              </div>
              <div>
                <Controller name="checkOut" control={c2} render={({ field }) => (
                  <NativeInput {...field} type="date" label={locale === 'fr' ? 'Départ' : 'Check-out'} error={e2.checkOut?.message} />
                )} />
              </div>
            </div>
            {nights > 0 && selectedRoom && (
              <div style={{ background: '#FAF7F2', borderRadius: 10, padding: '10px 14px', border: '1px solid #EDE8DF', fontSize: 13, color: '#5C6068' }}>
                {nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'} × {formatAmount(selectedRoom.basePrice, selectedRoom.currency)} ={' '}
                <strong style={{ color: '#B5924C', fontFamily: 'var(--font-dm-mono), monospace' }}>
                  {formatAmount(roomTotal, selectedRoom.currency)}
                </strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button type="button" onClick={() => setStep(0)} style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#5C6068', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={16} strokeWidth={1.5} /> {locale === 'fr' ? 'Retour' : 'Back'}
            </button>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {locale === 'fr' ? 'Suivant' : 'Next'} <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2 — Services */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, color: '#3D1F0F', marginBottom: 20 }}>
            {locale === 'fr' ? 'Services additionnels' : 'Additional services'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SERVICES.map((svc) => {
              const qty = serviceQtys[svc.id] ?? 0
              return (
                <div
                  key={svc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: qty > 0 ? '#B5924C08' : '#FFFFFF',
                    border: `1px solid ${qty > 0 ? '#B5924C44' : '#EDE8DF'}`,
                    borderRadius: 10,
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#3D1F0F' }}>
                      {locale === 'fr' ? svc.name : svc.nameEn}
                    </div>
                    <div style={{ fontSize: 11, color: '#5C6068' }}>
                      {formatAmount(svc.unitPrice, svc.currency)} / {svc.unit}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setServiceQtys((prev) => ({ ...prev, [svc.id]: Math.max(0, (prev[svc.id] ?? 0) - 1) }))}
                      style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #EDE8DF', background: '#FAF7F2', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#5C6068' }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 14, fontWeight: 600, color: '#3D1F0F', minWidth: 20, textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => setServiceQtys((prev) => ({ ...prev, [svc.id]: (prev[svc.id] ?? 0) + 1 }))}
                      style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #B5924C', background: '#B5924C18', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#B5924C' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#5C6068', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={16} strokeWidth={1.5} /> {locale === 'fr' ? 'Retour' : 'Back'}
            </button>
            <button onClick={() => setStep(3)} style={{ background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {locale === 'fr' ? 'Récapitulatif' : 'Summary'} <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Summary */}
      {step === 3 && step1Data && step2Data && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, color: '#3D1F0F', marginBottom: 20 }}>
            {locale === 'fr' ? 'Récapitulatif' : 'Summary'}
          </h3>

          <div style={{ background: '#FAF7F2', borderRadius: 12, padding: '16px', border: '1px solid #EDE8DF', marginBottom: 16 }}>
            {/* Guest */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#5C6068', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {locale === 'fr' ? 'Client' : 'Guest'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3D1F0F' }}>
                {step1Data.firstName} {step1Data.lastName}
              </div>
              <div style={{ fontSize: 12, color: '#5C6068' }}>{step1Data.email} · {step1Data.phone}</div>
            </div>

            <div className="brass-line" style={{ margin: '12px 0' }} />

            {/* Room & dates */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#5C6068', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {locale === 'fr' ? 'Séjour' : 'Stay'}
              </div>
              <div style={{ fontSize: 13, color: '#3D1F0F' }}>
                Chambre {selectedRoom?.number} — {selectedRoom?.type}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#5C6068' }}>
                {step2Data.checkIn} → {step2Data.checkOut} ({nights}n)
              </div>
            </div>

            <div className="brass-line" style={{ margin: '12px 0' }} />

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5C6068' }}>
                <span>{locale === 'fr' ? 'Hébergement' : 'Accommodation'}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>{roomTotal}€</span>
              </div>
              {servicesTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5C6068' }}>
                  <span>{locale === 'fr' ? 'Services' : 'Services'}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>{servicesTotal}€</span>
                </div>
              )}
              <div className="brass-line" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                <span style={{ fontFamily: 'var(--font-cormorant), serif' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#B5924C' }}>
                  {grandTotal}€
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button type="button" onClick={() => setStep(2)} style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#5C6068', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={16} strokeWidth={1.5} /> {locale === 'fr' ? 'Retour' : 'Back'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? '#EDE8DF' : 'linear-gradient(135deg, #1A6B4A, #2D9B6F)',
                color: submitting ? '#5C6068' : '#FAF7F2',
                border: 'none',
                borderRadius: 10,
                padding: '10px 28px',
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {submitting
                ? (locale === 'fr' ? 'Enregistrement…' : 'Processing…')
                : (locale === 'fr' ? 'Confirmer le check-in' : 'Confirm check-in')}
              {!submitting && <CheckCircle size={15} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
