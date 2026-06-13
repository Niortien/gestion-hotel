// components/parametres/PricingForm.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { PRICING_RULES } from '@/lib/data/hotel'
import type { PricingRule } from '@/types/hotel'
import { Percent, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

const schema = z.object({
  roomType:     z.string().min(1),
  season:       z.string().min(1),
  pricePerNight: z.number().min(0),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
  minNights:    z.number().optional(),
})

type FormData = z.infer<typeof schema>

export function PricingForm() {
  const locale = useHotelStore((s) => s.locale)
  const [rules, setRules] = useState<PricingRule[]>(PRICING_RULES)
  const [editId, setEditId] = useState<string | null>(null)

  const rule = rules.find((r) => r.id === editId)

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: rule
      ? { roomType: rule.roomType, season: rule.season, pricePerNight: rule.pricePerNight, startDate: rule.startDate ?? '', endDate: rule.endDate ?? '', minNights: rule.minNights ?? 1 }
      : { roomType: 'standard', season: 'normale', pricePerNight: 0 },
  })

  const onSelect = (r: PricingRule) => {
    setEditId(r.id)
    reset({ roomType: r.roomType, season: r.season, pricePerNight: r.pricePerNight, startDate: r.startDate ?? '', endDate: r.endDate ?? '', minNights: r.minNights ?? 1 })
  }

  const onSubmit = (data: FormData) => {
    setRules((prev) => prev.map((r) => r.id === editId ? { ...r, roomType: data.roomType as PricingRule['roomType'], season: data.season as PricingRule['season'], pricePerNight: data.pricePerNight, startDate: data.startDate ?? '', endDate: data.endDate ?? '', minNights: data.minNights } : r))
    toast.success(locale === 'fr' ? 'Tarif mis à jour' : 'Pricing rule updated')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {locale === 'fr' ? 'Règles tarifaires' : 'Pricing rules'}
        </div>
        {rules.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            style={{
              textAlign: 'left',
              padding: '9px 12px',
              borderRadius: 10,
              border: `1px solid ${editId === r.id ? '#B5924C' : '#EDE8DF'}`,
              background: editId === r.id ? '#B5924C12' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: editId === r.id ? '#B5924C' : '#3D1F0F' }}>
              {r.roomType} — {r.season}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Percent size={10} strokeWidth={1.25} style={{ color: '#5C6068' }} />
              <span style={{ fontSize: 10, color: '#5C6068', fontFamily: 'var(--font-dm-mono), monospace' }}>
                {r.pricePerNight} FCFA/nuit
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Edit form */}
      <div>
        {!editId ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5C6068', fontSize: 13 }}>
            {locale === 'fr' ? 'Sélectionnez une règle à modifier' : 'Select a rule to edit'}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Controller name="roomType" control={control} render={({ field }) => (
                <NativeSelect label={locale === 'fr' ? 'Type de chambre' : 'Room type'} value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                  {['standard', 'deluxe', 'suite', 'prestige'].map((t) => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              )} />
              <Controller name="season" control={control} render={({ field }) => (
                <NativeSelect label={locale === 'fr' ? 'Saison' : 'Season'} value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                  <option value="haute">{locale === 'fr' ? 'Haute' : 'High'}</option>
                  <option value="normale">{locale === 'fr' ? 'Normale' : 'Normal'}</option>
                  <option value="basse">{locale === 'fr' ? 'Basse' : 'Low'}</option>
                </NativeSelect>
              )} />
              <Controller name="pricePerNight" control={control} render={({ field }) => (
                <NativeInput {...field} type="number" label={locale === 'fr' ? 'Prix/nuit' : 'Price/night'} value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
              )} />
              <Controller name="minNights" control={control} render={({ field }) => (
                <NativeInput {...field} type="number" label={locale === 'fr' ? 'Nuits min.' : 'Min. nights'} value={String(field.value ?? 1)} onChange={(e) => field.onChange(Number(e.target.value))} />
              )} />
              <Controller name="startDate" control={control} render={({ field }) => (
                <NativeInput {...field} type="date" label={locale === 'fr' ? 'Début' : 'Start'} />
              )} />
              <Controller name="endDate" control={control} render={({ field }) => (
                <NativeInput {...field} type="date" label={locale === 'fr' ? 'Fin' : 'End'} />
              )} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={!isDirty} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', background: isDirty ? 'linear-gradient(135deg, #B5924C, #D4AF72)' : '#EDE8DF', color: isDirty ? '#FAF7F2' : '#5C6068', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: isDirty ? 'pointer' : 'not-allowed' }}>
                <Save size={13} strokeWidth={1.5} />
                {locale === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
