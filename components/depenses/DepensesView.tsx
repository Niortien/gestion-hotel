// components/depenses/DepensesView.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { pdf } from '@react-pdf/renderer'
import { Plus, Download, Trash2, TrendingDown, Filter, Search } from 'lucide-react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useDepenses, useCreateDepense, useDeleteDepense } from '@/lib/queries/depenses'
import { NativeInput, NativeSelect, SimpleModal } from '@/components/common/ui'
import { DateRangePicker, type DateRange } from '@/components/common/DateRangePicker'
import { PdfDepenseDocument } from './PdfDepenseDocument'
import { formatAmount, formatDate } from '@/lib/utils/format'
import type { ApiDepense, ApiDepenseCategorie, DepenseListParams } from '@/lib/api/types'

const CATEGORIES: { value: ApiDepenseCategorie; label: string }[] = [
  { value: 'FOURNITURES',  label: 'Fournitures' },
  { value: 'ALIMENTATION', label: 'Alimentation' },
  { value: 'ENTRETIEN',    label: 'Entretien & Maintenance' },
  { value: 'SALAIRES',     label: 'Salaires & Charges' },
  { value: 'SERVICES',     label: 'Services Externes' },
  { value: 'EQUIPEMENT',   label: 'Équipement' },
  { value: 'AUTRE',        label: 'Autre' },
]

const CAT_COLORS: Record<ApiDepenseCategorie, string> = {
  FOURNITURES:  '#B5924C',
  ALIMENTATION: '#2E7D32',
  ENTRETIEN:    '#1565C0',
  SALAIRES:     '#6A1B9A',
  SERVICES:     '#E65100',
  EQUIPEMENT:   '#00695C',
  AUTRE:        '#5C6068',
}

const schema = z.object({
  libelle:   z.string().min(2, 'Libellé requis (min. 2 car.)'),
  montant:   z.number({ invalid_type_error: 'Montant invalide' }).positive('Le montant doit être positif'),
  categorie: z.enum(['FOURNITURES', 'ALIMENTATION', 'ENTRETIEN', 'SALAIRES', 'SERVICES', 'EQUIPEMENT', 'AUTRE']),
  date:      z.string().optional(),
  note:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function DepensesView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<ApiDepenseCategorie | ''>('')
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })

  const queryParams: DepenseListParams = {
    limit: 100,
    ...(filterCat ? { categorie: filterCat } : {}),
    ...(dateRange.from ? { from: dateRange.from } : {}),
    ...(dateRange.to   ? { to:   dateRange.to   } : {}),
    ...(search         ? { q:    search          } : {}),
  }

  const { data: result, isLoading } = useDepenses(queryParams)
  const createMutation  = useCreateDepense()
  const deleteMutation  = useDeleteDepense()

  const depenses = result?.data ?? []
  const totalMontant = depenses.reduce((s, d) => s + Number(d.montant), 0)

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      libelle:   '',
      montant:   undefined,
      categorie: 'AUTRE',
      date:      new Date().toISOString().slice(0, 10),
      note:      '',
    },
  })

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({
      libelle:   data.libelle,
      montant:   data.montant,
      categorie: data.categorie,
      date:      data.date ? new Date(data.date).toISOString() : undefined,
      note:      data.note || undefined,
    })
    toast.success('Dépense enregistrée')
    reset()
    setShowModal(false)
  }

  const handleDelete = async (id: string, libelle: string) => {
    if (!confirm(`Supprimer la dépense "${libelle}" ?`)) return
    await deleteMutation.mutateAsync(id)
    toast.success('Dépense supprimée')
  }

  const handleDownloadPdf = async (depense: ApiDepense) => {
    const blob = await pdf(<PdfDepenseDocument depense={depense} />).toBlob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `depense-${depense.id.slice(0, 8)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={pageRef} style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Dépenses
          </h1>
          <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
            Suivi des dépenses opérationnelles de l'hôtel
          </p>
          <div className="brass-line" style={{ marginTop: 16 }} />
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #B5924C, #D4AF72)',
            color: '#FAF7F2', border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(181,146,76,0.3)',
          }}
        >
          <Plus size={15} strokeWidth={2} />
          Nouvelle dépense
        </button>
      </div>

      {/* KPI */}
      <div data-animate style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total dépenses', value: formatAmount(totalMontant, 'FCFA'), icon: TrendingDown, color: '#8B1A2F' },
          { label: 'Nombre d\'entrées', value: String(depenses.length), icon: Filter, color: '#B5924C' },
          { label: 'Moy. par dépense', value: depenses.length > 0 ? formatAmount(Math.round(totalMontant / depenses.length), 'FCFA') : '— FCFA', icon: TrendingDown, color: '#5C6068' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={16} strokeWidth={1.25} style={{ color }} />
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 20, fontWeight: 700, color: '#3D1F0F', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 16, alignItems: 'end' }}>
          <DateRangePicker value={dateRange} onChange={setDateRange} label="Période" />
          <div>
            <NativeSelect
              label="Catégorie"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as ApiDepenseCategorie | '')}
            >
              <option value="">Toutes</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </NativeSelect>
          </div>
        </div>
        <div style={{ marginTop: 12, position: 'relative' }}>
          <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5C6068' }} />
          <input
            placeholder="Rechercher dans le libellé ou la note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 30px',
              background: '#FAF7F2',
              border: '1px solid #EDE8DF',
              borderRadius: 10,
              fontSize: 13,
              color: '#3D1F0F',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 16, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px 110px 80px', gap: 0, padding: '10px 20px', background: '#FAF7F2', borderBottom: '1px solid #EDE8DF' }}>
          {['Libellé', 'Catégorie', 'Montant', 'Date', ''].map((h) => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#5C6068', fontSize: 13 }}>Chargement…</div>
        ) : depenses.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#5C6068', fontSize: 13 }}>
            Aucune dépense enregistrée
          </div>
        ) : (
          depenses.map((dep) => (
            <div
              key={dep.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 140px 110px 80px',
                gap: 0,
                padding: '12px 20px',
                borderBottom: '1px solid #EDE8DF',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#FAF7F2' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>{dep.libelle}</div>
                {dep.note && <div style={{ fontSize: 11, color: '#5C6068', marginTop: 2 }}>{dep.note}</div>}
              </div>
              <div>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  background: `${CAT_COLORS[dep.categorie] ?? '#5C6068'}18`,
                  color: CAT_COLORS[dep.categorie] ?? '#5C6068',
                }}>
                  {CATEGORIES.find((c) => c.value === dep.categorie)?.label ?? dep.categorie}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13, fontWeight: 700, color: '#8B1A2F' }}>
                {formatAmount(Number(dep.montant), 'FCFA')}
              </div>
              <div style={{ fontSize: 12, color: '#5C6068' }}>
                {formatDate(dep.date)}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDownloadPdf(dep)}
                  title="Télécharger le PDF"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: '1px solid #EDE8DF', background: '#FAF7F2',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#B5924C',
                  }}
                >
                  <Download size={13} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(dep.id, dep.libelle)}
                  title="Supprimer"
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: '1px solid #EDE8DF', background: '#FAF7F2',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#8B1A2F',
                  }}
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <SimpleModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); reset() }}
        title="Nouvelle dépense"
        width={500}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Controller name="libelle" control={control} render={({ field }) => (
            <NativeInput {...field} label="Libellé *" placeholder="Ex: Achat de draps et serviettes" error={errors.libelle?.message} />
          )} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Controller name="montant" control={control} render={({ field }) => (
              <NativeInput
                {...field}
                type="number"
                label="Montant (FCFA) *"
                placeholder="0"
                min={0}
                step={1}
                error={errors.montant?.message}
                value={field.value === undefined ? '' : String(field.value)}
                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
              />
            )} />
            <Controller name="categorie" control={control} render={({ field }) => (
              <NativeSelect label="Catégorie" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            )} />
          </div>

          <Controller name="date" control={control} render={({ field }) => (
            <NativeInput {...field} type="date" label="Date de la dépense" />
          )} />

          <Controller name="note" control={control} render={({ field }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#5C6068', letterSpacing: '0.04em' }}>Note (optionnel)</label>
              <textarea
                {...field}
                rows={3}
                placeholder="Fournisseur, référence, remarques…"
                style={{
                  width: '100%', padding: '9px 12px',
                  background: '#FFFFFF', border: '1px solid #EDE8DF',
                  borderRadius: 10, fontSize: 13, color: '#3D1F0F',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#B5924C' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#EDE8DF' }}
              />
            </div>
          )} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => { setShowModal(false); reset() }}
              style={{ padding: '9px 20px', border: '1px solid #EDE8DF', background: '#FAF7F2', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#5C6068' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                background: isSubmitting ? '#EDE8DF' : 'linear-gradient(135deg, #B5924C, #D4AF72)',
                color: isSubmitting ? '#5C6068' : '#FAF7F2',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </SimpleModal>
    </div>
  )
}
