// components/chambres/RoomCreateModal.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap } from '@/lib/animations/gsap.config'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useCreateRoom } from '@/lib/queries/rooms'
import { CURRENCY_OPTIONS } from '@/lib/utils/format'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const schema = z.object({
  number: z.string().trim().min(1, 'Requis'),
  floor: z.string().trim().min(1, 'Min. étage 1').refine((value) => /^\d+$/.test(value), 'Min. étage 1'),
  type: z.enum(['standard', 'deluxe', 'suite']),
  price: z.string().trim().min(1, 'Prix invalide').refine((value) => /^\d+(\.\d+)?$/.test(value), 'Prix invalide'),
  currency: z.enum(['FCFA', 'EUR', 'USD']),
  status: z.enum(['libre', 'occupee', 'travaux', 'nettoyage']).optional(),
})

type FormData = z.infer<typeof schema>

interface Props { onClose: () => void }

export function RoomCreateModal({ onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const locale     = useHotelStore((s) => s.locale)
  const createRoom = useCreateRoom()

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { number: '', type: 'standard', status: 'libre', floor: '1', price: '25000', currency: 'FCFA' as const },
  })

  useEffect(() => {
    if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    if (panelRef.current)   gsap.fromTo(panelRef.current,  { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
  }, [])

  const close = () => {
    if (!overlayRef.current || !panelRef.current) return onClose()
    gsap.to(panelRef.current,  { y: 24, opacity: 0, duration: 0.2 })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose })
  }

  const onSubmit = async (data: FormData) => {
    try {
      await createRoom.mutateAsync({
        number:   data.number,
        floor:    Number(data.floor),
        type:     data.type,
        price:    Number(data.price),
        currency: data.currency,
        status:   data.status,
      })
      toast.success(locale === 'fr' ? 'Chambre créée' : 'Room created')
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const t = {
    title:    locale === 'fr' ? 'Nouvelle chambre'   : 'New room',
    number:   locale === 'fr' ? 'Numéro'             : 'Number',
    floor:    locale === 'fr' ? 'Étage'              : 'Floor',
    type:     locale === 'fr' ? 'Type'               : 'Type',
    price:    locale === 'fr' ? 'Prix / nuit'        : 'Price / night',
    currency: locale === 'fr' ? 'Devise'             : 'Currency',
    status:   locale === 'fr' ? 'Statut initial'     : 'Initial status',
    cancel:   locale === 'fr' ? 'Annuler'            : 'Cancel',
    create:   locale === 'fr' ? 'Créer la chambre'   : 'Create room',
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(61,31,15,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        ref={panelRef}
        style={{
          background: '#FAF7F2',
          borderRadius: 20,
          width: '100%',
          maxWidth: 440,
          border: '1px solid #EDE8DF',
          boxShadow: '0 16px 64px rgba(61,31,15,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #EDE8DF',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 22, fontWeight: 600, color: '#3D1F0F',
          }}>
            {t.title}
          </h2>
          <button
            onClick={close}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5C6068', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Number + Floor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Controller name="number" control={control} render={({ field }) => (
              <NativeInput {...field} label={t.number} placeholder="101" error={errors.number?.message} />
            )} />
            <Controller name="floor" control={control} render={({ field }) => (
              <NativeInput {...field} type="number" min={1} label={t.floor} placeholder="1" error={errors.floor?.message} />
            )} />
          </div>

          {/* Type */}
          <Controller name="type" control={control} render={({ field }) => (
            <NativeSelect {...field} label={t.type} error={errors.type?.message}>
              <option value="standard">{locale === 'fr' ? 'Standard (Single)' : 'Standard (Single)'}</option>
              <option value="deluxe">{locale === 'fr' ? 'Deluxe (Double)'   : 'Deluxe (Double)'}</option>
              <option value="suite">{locale === 'fr' ? 'Suite'              : 'Suite'}</option>
            </NativeSelect>
          )} />

          {/* Price + Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Controller name="price" control={control} render={({ field }) => (
              <NativeInput {...field} type="number" min={0} step={1} label={t.price} placeholder="25000" error={errors.price?.message} />
            )} />
            <Controller name="currency" control={control} render={({ field }) => (
              <NativeSelect {...field} label={t.currency} error={errors.currency?.message}>
                {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            )} />
          </div>

          {/* Status */}
          <Controller name="status" control={control} render={({ field }) => (
            <NativeSelect {...field} label={t.status} error={errors.status?.message}>
              <option value="libre">{locale === 'fr' ? 'Libre'      : 'Available'}</option>
              <option value="nettoyage">{locale === 'fr' ? 'Nettoyage' : 'Cleaning'}</option>
              <option value="travaux">{locale === 'fr' ? 'Travaux'   : 'Maintenance'}</option>
            </NativeSelect>
          )} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={close}
              style={{
                flex: 1, padding: '10px 0',
                background: '#EDE8DF', border: 'none', borderRadius: 10,
                fontSize: 13, color: '#5C6068', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2, padding: '10px 0',
                background: isSubmitting ? '#C9A84C88' : '#B5924C',
                border: 'none', borderRadius: 10,
                fontSize: 13, color: '#FAF7F2', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 600, letterSpacing: '0.02em',
              }}
            >
              {isSubmitting ? '…' : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
