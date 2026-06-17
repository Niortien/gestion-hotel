// components/resume/ResumeView.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useResumePeriode } from '@/lib/queries/rapports-financiers'
import { HotelDateRangePicker, type HotelDateRange } from '@/components/common/HotelDateRangePicker'
import { formatAmount } from '@/lib/utils/format'
import {
  Activity, LogIn, LogOut, Wallet, TrendingUp, TrendingDown,
  BedDouble, Wrench, Sparkles, ConciergeBell, CalendarDays,
} from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function weekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().slice(0, 10)
}

function monthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const EVENT_ICONS: Record<string, React.FC<{ size: number; strokeWidth: number; style?: React.CSSProperties }>> = {
  checkin:  LogIn,
  checkout: LogOut,
  service:  ConciergeBell,
  paiement: Wallet,
}
const EVENT_COLORS: Record<string, string> = {
  checkin:  '#1558A0',
  checkout: '#2E7D32',
  service:  '#B5924C',
  paiement: '#6B21A8',
}

interface KpiProps { label: string; value: React.ReactNode; color?: string; sub?: string; icon: React.FC<{ size: number; strokeWidth: number; style?: React.CSSProperties }> }

function Kpi({ label, value, color = '#3D1F0F', sub, icon: Icon }: KpiProps) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#B5924C12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SectionCard({ title, icon: Icon, from, to, locale }: { title: string; icon: React.FC<{ size: number; strokeWidth: number; style?: React.CSSProperties }>; from: string; to: string; locale: string }) {
  const { data, isLoading } = useResumePeriode(from, to)
  const revColor = '#2E7D32'
  const depColor = '#8B1A2F'
  const netColor = (v: number) => v >= 0 ? revColor : depColor

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
        <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, fontWeight: 400, color: '#3D1F0F' }}>{title}</h3>
      </div>

      {isLoading ? (
        <div style={{ fontSize: 12, color: '#5C6068' }}>Chargement…</div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: locale === 'fr' ? 'Réservations' : 'Reservations', value: data.reservations.count, color: '#3D1F0F' },
            { label: locale === 'fr' ? 'Revenus' : 'Revenue',           value: formatAmount(data.reservations.revenus, 'FCFA'), color: revColor },
            { label: locale === 'fr' ? 'Dépenses' : 'Expenses',         value: formatAmount(data.depenses.total, 'FCFA'), color: depColor },
            { label: 'Bénéfice net',                                     value: formatAmount(data.beneficeNet, 'FCFA'), color: netColor(data.beneficeNet) },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#FAF7F2', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 14, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ResumeView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale  = useHotelStore((s) => s.locale)

  const [range, setRange] = useState<HotelDateRange>({ from: todayStr(), to: todayStr() })
  const { data, isLoading, isFetching } = useResumePeriode(range.from, range.to)

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const revColor = '#2E7D32'
  const depColor = '#8B1A2F'
  const netColor = (v: number) => v >= 0 ? revColor : depColor

  return (
    <div ref={pageRef} style={{ maxWidth: 980, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {locale === 'fr' ? 'Résumé des activités' : 'Activity summary'}
        </h1>
        <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
          {locale === 'fr' ? 'Vue complète : réservations, dépenses, événements et bénéfice' : 'Complete view: reservations, expenses, events and profit'}
        </p>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Date picker */}
      <div data-animate style={{ marginBottom: 24 }}>
        <HotelDateRangePicker
          value={range}
          onChange={setRange}
          label={locale === 'fr' ? 'Période analysée' : 'Period'}
        />
        {isFetching && !isLoading && (
          <span style={{ marginLeft: 12, fontSize: 11, color: '#B5924C' }}>Actualisation…</span>
        )}
      </div>

      {/* KPI row */}
      {data && (
        <div data-animate style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          <Kpi label={locale === 'fr' ? 'Check-ins' : 'Check-ins'} value={data.checkIns} icon={LogIn} />
          <Kpi label={locale === 'fr' ? 'Check-outs' : 'Check-outs'} value={data.checkOuts} icon={LogOut} />
          <Kpi label={locale === 'fr' ? 'Revenus' : 'Revenue'} value={formatAmount(data.reservations.revenus, 'FCFA')} color={revColor} icon={TrendingUp} />
          <Kpi label={locale === 'fr' ? 'Dépenses' : 'Expenses'} value={formatAmount(data.depenses.total, 'FCFA')} color={depColor} icon={TrendingDown} />
          <Kpi label="Bénéfice net" value={formatAmount(data.beneficeNet, 'FCFA')} color={netColor(data.beneficeNet)} icon={Wallet} />
        </div>
      )}

      {/* Room status snapshot */}
      {data && (
        <div data-animate style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: locale === 'fr' ? 'Libres' : 'Free', value: data.chambres.libre, icon: BedDouble, color: '#2E7D32' },
            { label: locale === 'fr' ? 'Occupées' : 'Occupied', value: data.chambres.occupee, icon: BedDouble, color: '#1558A0' },
            { label: locale === 'fr' ? 'Nettoyage' : 'Cleaning', value: data.chambres.nettoyage, icon: Sparkles, color: '#B5924C' },
            { label: locale === 'fr' ? 'Travaux' : 'Maintenance', value: data.chambres.travaux, icon: Wrench, color: '#D4281C' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} strokeWidth={1.25} style={{ color }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: '#5C6068', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservations by status */}
      {data && Object.keys(data.reservations.parStatut).some((k) => data.reservations.parStatut[k] > 0) && (
        <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CalendarDays size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, fontWeight: 400, color: '#3D1F0F' }}>
              {locale === 'fr' ? 'Réservations de la période' : 'Period reservations'}
            </h2>
            <span style={{ marginLeft: 4, background: '#B5924C18', color: '#B5924C', fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '2px 8px', fontFamily: 'var(--font-dm-mono), monospace' }}>
              {data.reservations.count}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { key: 'CONFIRMEE', label: locale === 'fr' ? 'Confirmées' : 'Confirmed', color: '#1A6B4A' },
              { key: 'CHECKIN',   label: locale === 'fr' ? 'En cours' : 'Checked-in', color: '#1558A0' },
              { key: 'CHECKOUT',  label: locale === 'fr' ? 'Terminées' : 'Checked-out', color: '#2E7D32' },
              { key: 'NOSHOW',    label: 'No-show', color: '#8B1A2F' },
            ].map(({ key, label, color }) => {
              const count = data.reservations.parStatut[key] ?? 0
              if (count === 0) return null
              return (
                <div key={key} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 10, padding: '8px 14px' }}>
                  <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color }}>{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Events timeline */}
      {data && data.events.length > 0 && (
        <div data-animate style={{ background: '#FFFFFF', border: '1px solid #EDE8DF', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Activity size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, fontWeight: 400, color: '#3D1F0F' }}>
              {locale === 'fr' ? 'Fil des événements' : 'Event timeline'}
            </h2>
            <span style={{ marginLeft: 4, background: '#B5924C18', color: '#B5924C', fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '2px 8px', fontFamily: 'var(--font-dm-mono), monospace' }}>
              {data.events.length}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: '#EDE8DF' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {data.events.map((ev, i) => {
                const Icon = EVENT_ICONS[ev.type] ?? Activity
                const color = EVENT_COLORS[ev.type] ?? '#5C6068'
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 14, paddingBottom: i < data.events.length - 1 ? 14 : 0 }}>
                    {/* Dot */}
                    <div style={{ flexShrink: 0, width: 29, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}15`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                        <Icon size={12} strokeWidth={1.5} style={{ color }} />
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, background: '#FAF7F2', borderRadius: 10, padding: '10px 14px', border: '1px solid #EDE8DF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>
                            {locale === 'fr' ? ev.title : ev.titleEn}
                          </div>
                          <div style={{ fontSize: 11, color: '#5C6068', marginTop: 2 }}>{ev.description}</div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: '#9CA3AF' }}>
                            {formatDateShort(ev.time)} {formatTime(ev.time)}
                          </div>
                          {ev.amount != null && ev.amount > 0 && (
                            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#B5924C', fontWeight: 700, marginTop: 2 }}>
                              {formatAmount(ev.amount, 'FCFA')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading / empty state */}
      {isLoading && (
        <div data-animate style={{ textAlign: 'center', padding: '48px 0', color: '#5C6068', fontSize: 14 }}>
          {locale === 'fr' ? 'Chargement du résumé…' : 'Loading summary…'}
        </div>
      )}
      {!isLoading && data && data.events.length === 0 && data.reservations.count === 0 && (
        <div data-animate style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>
          {locale === 'fr' ? 'Aucune activité sur cette période.' : 'No activity for this period.'}
        </div>
      )}

      {/* Weekly & Monthly summaries */}
      <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <SectionCard
          title={locale === 'fr' ? 'Cette semaine' : 'This week'}
          icon={Activity}
          from={weekStart()}
          to={todayStr()}
          locale={locale}
        />
        <SectionCard
          title={locale === 'fr' ? 'Ce mois' : 'This month'}
          icon={TrendingUp}
          from={monthStart()}
          to={todayStr()}
          locale={locale}
        />
      </div>
    </div>
  )
}
