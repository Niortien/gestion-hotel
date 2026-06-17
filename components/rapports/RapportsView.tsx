// components/rapports/RapportsView.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useReservations } from '@/lib/queries/reservations'
import { useGuests } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { useRapportMensuel, useRevenueRange } from '@/lib/queries/rapports-financiers'
import { ReportSelector } from './ReportSelector'
import { DateRangePicker, type DateRange } from '@/components/common/DateRangePicker'
import { NativeInput } from '@/components/common/ui'
import { formatAmount } from '@/lib/utils/format'
import {
  FileText, TrendingUp, TrendingDown, Users, BedDouble,
  BarChart3, Wallet,
} from 'lucide-react'

export function RapportsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale  = useHotelStore((s) => s.locale)

  const { data: reservations = [] } = useReservations()
  const { data: guests = [] }       = useGuests()
  const { data: rooms = [] }        = useRooms()

  // Monthly report state
  const defaultMois = new Date().toISOString().slice(0, 7)
  const [mois, setMois] = useState(defaultMois)
  const { data: rapport, isLoading: rapportLoading } = useRapportMensuel(mois)

  // Revenue range state
  const [rangeDate, setRangeDate] = useState<DateRange>({ from: '', to: '' })
  const { data: rangeRevenu, isFetching: rangeFetching } = useRevenueRange(rangeDate.from, rangeDate.to)

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const totalRevenue    = reservations.reduce((s, r) => s + r.totalAmount, 0)
  const occupiedRooms   = rooms.filter((r) => r.status === 'occupee').length
  const occupancyPct    = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0

  const topStats = [
    { label: locale === 'fr' ? 'Revenus totaux' : 'Total revenue',     value: formatAmount(totalRevenue, 'FCFA'), icon: TrendingUp },
    { label: locale === 'fr' ? 'Réservations'   : 'Reservations',      value: reservations.length,                icon: FileText },
    { label: locale === 'fr' ? 'Clients'         : 'Guests',           value: guests.length,                      icon: Users },
    { label: locale === 'fr' ? "Taux d'occupation" : 'Occupancy rate', value: `${occupancyPct}%`,                icon: BedDouble },
  ]

  const beneficeColor = (v: number) => v >= 0 ? '#2E7D32' : '#8B1A2F'

  return (
    <div ref={pageRef} style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {locale === 'fr' ? 'Rapports & Documents' : 'Reports & Documents'}
        </h1>
        <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
          {locale === 'fr' ? 'Génération de PDF, statistiques et état financier' : 'PDF generation, statistics and financial overview'}
        </p>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Top KPIs */}
      <div data-animate style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {topStats.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#B5924C12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 22, fontWeight: 700, color: '#3D1F0F', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Revenue par plage de dates ── */}
      <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Wallet size={18} strokeWidth={1.25} style={{ color: '#B5924C' }} />
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F' }}>
            Revenus par plage de dates
          </h2>
        </div>
        <p style={{ fontSize: 13, color: '#5C6068', marginBottom: 20 }}>
          Sélectionnez une période pour voir les revenus, dépenses et bénéfice net.
        </p>

        <DateRangePicker value={rangeDate} onChange={setRangeDate} />

        {rangeDate.from && rangeDate.to && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Revenus', value: formatAmount(rangeRevenu?.revenus ?? 0, 'FCFA'), color: '#2E7D32', sub: `${rangeRevenu?.reservationsCount ?? 0} réservation(s)` },
              { label: 'Dépenses', value: formatAmount(rangeRevenu?.depenses ?? 0, 'FCFA'), color: '#8B1A2F', sub: `${rangeRevenu?.depensesCount ?? 0} dépense(s)` },
              { label: 'Bénéfice net', value: formatAmount(rangeRevenu?.benefice ?? 0, 'FCFA'), color: beneficeColor(rangeRevenu?.benefice ?? 0), sub: rangeFetching ? 'Calcul…' : '' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ background: '#FAF7F2', borderRadius: 12, padding: '14px 16px', border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color }}>{value}</div>
                {sub && <div style={{ fontSize: 10, color: '#5C6068', marginTop: 4 }}>{sub}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rapport financier mensuel ── */}
      <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={18} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F' }}>
              Rapport financier mensuel
            </h2>
          </div>
          <NativeInput
            type="month"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            style={{ width: 160, fontSize: 13 }}
          />
        </div>
        <p style={{ fontSize: 13, color: '#5C6068', marginBottom: 20 }}>
          Revenus des réservations, dépenses enregistrées et bénéfice net pour le mois sélectionné.
        </p>

        {rapportLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#5C6068', fontSize: 13 }}>Chargement du rapport…</div>
        ) : rapport ? (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Revenus', value: formatAmount(rapport.totalRevenus, 'FCFA'), color: '#2E7D32', sub: `${rapport.reservationsCount} réservation(s)` },
                { label: 'Dépenses', value: formatAmount(rapport.totalDepenses, 'FCFA'), color: '#8B1A2F', sub: `${rapport.depensesCount} dépense(s)` },
                { label: 'Bénéfice net', value: formatAmount(rapport.beneficeNet, 'FCFA'), color: beneficeColor(rapport.beneficeNet), sub: rapport.beneficeNet >= 0 ? 'Excédentaire' : 'Déficitaire' },
              ].map(({ label, value, color, sub }) => (
                <div key={label} style={{ background: '#FAF7F2', borderRadius: 12, padding: '16px 18px', border: `2px solid ${color}20` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 22, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 10, color: '#5C6068', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Daily breakdown table — only show days with activity */}
            {rapport.parJour.some((j) => j.revenus > 0 || j.depenses > 0) && (
              <div style={{ background: '#FAF7F2', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDE8DF' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', padding: '10px 16px', background: '#3D1F0F' }}>
                  {['Date', 'Revenus', 'Dépenses', 'Net'].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#FAF7F2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                  ))}
                </div>
                {rapport.parJour
                  .filter((j) => j.revenus > 0 || j.depenses > 0)
                  .map((jour) => (
                    <div
                      key={jour.date}
                      style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', padding: '9px 16px', borderBottom: '1px solid #EDE8DF' }}
                    >
                      <div style={{ fontSize: 12, color: '#5C6068' }}>
                        {new Date(jour.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>
                        {jour.revenus > 0 ? formatAmount(jour.revenus, 'FCFA') : '—'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#8B1A2F', fontWeight: 600 }}>
                        {jour.depenses > 0 ? formatAmount(jour.depenses, 'FCFA') : '—'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: beneficeColor(jour.net), fontWeight: 700 }}>
                        {formatAmount(jour.net, 'FCFA')}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ── PDF Generator ── */}
      <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '24px 28px' }}>
        <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: '#3D1F0F', marginBottom: 6 }}>
          {locale === 'fr' ? 'Générer un document' : 'Generate a document'}
        </h2>
        <p style={{ fontSize: 13, color: '#5C6068', marginBottom: 20 }}>
          {locale === 'fr'
            ? 'Sélectionnez le type de document et la réservation, puis téléchargez le PDF.'
            : 'Select the document type and reservation, then download the PDF.'}
        </p>
        <ReportSelector />
      </div>
    </div>
  )
}
