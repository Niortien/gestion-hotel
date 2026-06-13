// components/parametres/RoomSettingsForm.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useUpdateRoom } from '@/lib/queries/rooms'
import type { Room, RoomStatus, RoomType, Currency } from '@/types/hotel'
import { CURRENCY_OPTIONS } from '@/lib/utils/format'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  number:      z.string().min(1),
  type:        z.string().min(1),
  status:      z.string().min(1),
  floor:       z.number().min(0).max(20),
  surface:     z.number().min(5).max(500),
  basePrice:   z.number().min(1),
  currency:    z.enum(['FCFA', 'EUR', 'USD']),
  capacity:    z.number().min(1).max(20),
  view:        z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const ROOM_TYPES: RoomType[] = ['standard', 'deluxe', 'suite', 'prestige']
const ROOM_STATUSES: RoomStatus[] = ['libre', 'occupee', 'nettoyage', 'travaux']

interface Props { room: Room }

export function RoomSettingsForm({ room }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const updateRoomMutation = useUpdateRoom()

  const { control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      number:      room.number,
      type:        room.type,
      status:      room.status,
      floor:       room.floor,
      surface:     room.surface,
      basePrice:   room.basePrice,
      currency:    (room.currency ?? 'FCFA') as Currency,
      capacity:    room.capacity,
      view:        room.view ?? '',
      description: room.description ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await updateRoomMutation.mutateAsync({
        id:       Number(room.id),
        number:   data.number,
        type:     data.type as RoomType,
        status:   data.status as RoomStatus,
        floor:    data.floor,
        price:    data.basePrice,
        currency: data.currency as Currency,
      })
      toast.success(locale === 'fr' ? 'Chambre mise à jour' : 'Room updated')
    } catch {
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Update failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Controller name="number" control={control} render={({ field }) => (
          <NativeInput {...field} label={locale === 'fr' ? 'Numéro' : 'Number'} />
        )} />
        <Controller name="floor" control={control} render={({ field }) => (
          <NativeInput {...field} type="number" label={locale === 'fr' ? 'Étage' : 'Floor'} value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
        )} />
        <Controller name="type" control={control} render={({ field }) => (
          <NativeSelect label="Type" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </NativeSelect>
        )} />
        <Controller name="status" control={control} render={({ field }) => (
          <NativeSelect label="Statut" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
            {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        )} />
        <Controller name="surface" control={control} render={({ field }) => (
          <NativeInput {...field} type="number" label="Surface (m²)" value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
        )} />
        <Controller name="capacity" control={control} render={({ field }) => (
          <NativeInput {...field} type="number" label={locale === 'fr' ? 'Capacité' : 'Capacity'} value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
        )} />
        <Controller name="basePrice" control={control} render={({ field }) => (
          <NativeInput {...field} type="number" label={locale === 'fr' ? 'Prix/nuit' : 'Price/night'} value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
        )} />
        <Controller name="currency" control={control} render={({ field }) => (
          <NativeSelect label={locale === 'fr' ? 'Devise' : 'Currency'} value={field.value} onChange={(e) => field.onChange(e.target.value)}>
            {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </NativeSelect>
        )} />
        <Controller name="view" control={control} render={({ field }) => (
          <NativeInput {...field} label="Vue" />
        )} />
      </div>
      <Controller name="description" control={control} render={({ field }) => (
        <NativeInput {...field} label={locale === 'fr' ? 'Description' : 'Description'} />
      )} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <button
          type="submit"
          disabled={!isDirty}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 22px',
            background: isDirty ? 'linear-gradient(135deg, #B5924C, #D4AF72)' : '#EDE8DF',
            color: isDirty ? '#FAF7F2' : '#5C6068',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: isDirty ? 'pointer' : 'not-allowed',
          }}
        >
          <Save size={13} strokeWidth={1.5} />
          {locale === 'fr' ? 'Enregistrer' : 'Save'}
        </button>
      </div>
    </form>
  )
}
