// components/dashboard/DashboardView.tsx
'use client'

import { useRef, useEffect } from 'react'
import { initGSAP, gsap } from '@/lib/animations/gsap.config'
import { animateCounter, animateCounterDecimal, animateOccupancyArc } from '@/lib/animations/counterAnimations'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useDashboardStats } from '@/lib/queries/dashboard'
import { formatAmount } from '@/lib/utils/format'
import { OccupancyTimeline } from './OccupancyTimeline'
import { AlertsPanel } from './AlertsPanel'
import { LiveFeed } from './LiveFeed'
import { RevenueStrip } from './RevenueStrip'
import {
  LogIn, LogOut, Sparkles, BedDouble, TrendingUp, DollarSign,
} from 'lucide-react'

const RADIUS = 52
const CIRC = 2 * Math.PI * RADIUS

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  counterRef,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  accent?: string
  counterRef?: React.RefObject<HTMLSpanElement | null>
}) {
  return (
    <div
      data-animate
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
        border: '1px solid #EDE8DF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: accent ? `${accent}08` : '#B5924C08',
          borderRadius: '0 20px 0 80px',
        }}
      />
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: accent ? `${accent}18` : '#B5924C18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={18} strokeWidth={1.25} style={{ color: accent ?? '#B5924C' }} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 2 }}>{label}</div>
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 28,
            fontWeight: 700,
            color: '#3D1F0F',
            lineHeight: 1,
          }}
        >
          <span ref={counterRef}>{value}</span>
        </div>
        {sub && <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

export function DashboardView() {
  const locale = useHotelStore((s) => s.locale)
  const pageRef = useRef<HTMLDivElement>(null)
  const { data: stats } = useDashboardStats()

  // Counter refs
  const checkInsRef = useRef<HTMLSpanElement>(null)
  const checkOutsRef = useRef<HTMLSpanElement>(null)
  const revenueRef = useRef<HTMLSpanElement>(null)
  const freeRef = useRef<HTMLSpanElement>(null)
  const cleaningRef = useRef<HTMLSpanElement>(null)
  const monthRevenueRef = useRef<HTMLSpanElement>(null)
  const arcRef = useRef<SVGPathElement>(null)
  const occupancyRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  // Animate counters when API data arrives
  useEffect(() => {
    if (!stats) return
    if (checkInsRef.current) animateCounter(checkInsRef.current, stats.checkInsToday, 1.2)
    if (checkOutsRef.current) animateCounter(checkOutsRef.current, stats.checkOutsToday, 1.2)
    if (freeRef.current) animateCounter(freeRef.current, stats.libreCount, 1.2)
    if (cleaningRef.current) animateCounter(cleaningRef.current, stats.nettoyageCount, 1.2)
    if (revenueRef.current) {
      animateCounter(revenueRef.current, stats.todayRevenue, 1.8, (v) => formatAmount(Math.round(v), 'FCFA'))
    }
    if (monthRevenueRef.current) {
      animateCounter(monthRevenueRef.current, stats.weekRevenue, 2, (v) => formatAmount(Math.round(v), 'FCFA'))
    }
    if (occupancyRef.current) {
      animateCounterDecimal(occupancyRef.current, stats.occupancyRate, 1, 1.8, '%')
    }
    if (arcRef.current) {
      arcRef.current.style.strokeDasharray = `${CIRC}`
      animateOccupancyArc(arcRef.current, stats.occupancyRate, CIRC)
    }
  }, [stats])

  const t = {
    title:        locale === 'fr' ? 'Tableau de bord'   : 'Dashboard',
    subtitle:     locale === 'fr' ? 'Vue d\'ensemble'   : 'Hotel overview',
    occupancy:    locale === 'fr' ? 'Taux d\'occupation': 'Occupancy rate',
    arrivals:     locale === 'fr' ? 'Arrivées du jour'  : "Today's arrivals",
    departures:   locale === 'fr' ? 'Départs du jour'   : "Today's departures",
    todayRev:     locale === 'fr' ? 'Revenus du jour'   : "Today's revenue",
    weekRev:      locale === 'fr' ? 'Revenus semaine'   : 'Weekly revenue',
    free:         locale === 'fr' ? 'Chambres libres'   : 'Available rooms',
    cleaning:     locale === 'fr' ? 'En nettoyage'      : 'Cleaning',
    timeline:     locale === 'fr' ? 'Chronologie'       : 'Timeline',
  }

  return (
    <div ref={pageRef} style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 42,
            fontWeight: 300,
            color: '#3D1F0F',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
        >
          {t.title}
        </h1>
        <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
          Grand Hôtel Lumière — {t.subtitle}
        </p>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Occupancy Arc + Stats */}
      <div
        data-animate
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 24,
          marginBottom: 28,
          alignItems: 'center',
        }}
      >
        {/* Arc */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
            border: '1px solid #EDE8DF',
          }}
        >
          <svg width="130" height="90" viewBox="0 0 130 90">
            {/* Track */}
            <path
              d="M 15 80 A 52 52 0 0 1 115 80"
              fill="none"
              stroke="#EDE8DF"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Progress */}
            <path
              ref={arcRef}
              d="M 15 80 A 52 52 0 0 1 115 80"
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
            />
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B5924C" />
                <stop offset="100%" stopColor="#D4AF72" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 28,
              fontWeight: 700,
              color: '#B5924C',
              marginTop: -12,
              lineHeight: 1,
            }}
          >
            <span ref={occupancyRef}>0%</span>
          </div>
          <div style={{ fontSize: 11, color: '#5C6068', marginTop: 6, textAlign: 'center' }}>
            {t.occupancy}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <StatCard icon={LogIn}     label={t.arrivals}   value="0"   counterRef={checkInsRef}   accent="#1A6B4A" />
          <StatCard icon={LogOut}    label={t.departures} value="0"   counterRef={checkOutsRef}  accent="#8B1A2F" />
          <StatCard icon={BedDouble} label={t.free}       value="0"   counterRef={freeRef}       accent="#B5924C" />
          <StatCard icon={Sparkles}  label={t.cleaning}   value="0"   counterRef={cleaningRef}   accent="#607856" />
          <StatCard icon={DollarSign} label={t.todayRev}  value="0" counterRef={revenueRef}    accent="#C9A84C" />
          <StatCard icon={TrendingUp} label={t.weekRev}  value="0" counterRef={monthRevenueRef} accent="#B5924C" />
        </div>
      </div>

      {/* Revenue Ticker */}
      <div data-animate style={{ marginBottom: 28 }}>
        <RevenueStrip />
      </div>

      {/* 3-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px 280px',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Timeline */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '20px 20px 20px 24px',
            boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
            border: '1px solid #EDE8DF',
          }}
        >
          <h3
            data-animate
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 18,
              fontWeight: 600,
              color: '#3D1F0F',
              marginBottom: 20,
            }}
          >
            {t.timeline}
          </h3>
          <OccupancyTimeline />
        </div>

        {/* Live Feed */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
            border: '1px solid #EDE8DF',
          }}
        >
          <LiveFeed />
        </div>

        {/* Alerts */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 2px 12px rgba(61,31,15,0.06)',
            border: '1px solid #EDE8DF',
          }}
        >
          <AlertsPanel />
        </div>
      </div>
    </div>
  )
}
