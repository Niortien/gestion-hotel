// components/rapports/RapportsView.tsx
'use client'

import { useRef, useEffect } from 'react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useReservations } from '@/lib/queries/reservations'
import { useGuests } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { ReportSelector } from './ReportSelector'
import { formatPrice } from '@/lib/utils/format'
import { FileText, TrendingUp, Users, BedDouble } from 'lucide-react'

export function RapportsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const { data: reservations = [] } = useReservations()
  const { data: guests = [] } = useGuests()
  const { data: rooms = [] } = useRooms()

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const totalRevenue = reservations.reduce((s, r) => s + r.totalAmount, 0)
  const occupiedRooms = rooms.filter((r) => r.status === 'occupee').length
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0

  const stats = [
    {
      label: locale === 'fr' ? 'Revenus totaux' : 'Total revenue',
      value: formatPrice(totalRevenue, 'FCFA', 'fr-FR'),
      icon: TrendingUp,
    },
    {
      label: locale === 'fr' ? 'Réservations' : 'Reservations',
      value: reservations.length,
      icon: FileText,
    },
    {
      label: locale === 'fr' ? 'Clients' : 'Guests',
      value: guests.length,
      icon: Users,
    },
    {
      label: locale === 'fr' ? 'Taux d\'occupation' : 'Occupancy rate',
      value: `${occupancyPct}%`,
      icon: BedDouble,
    },
  ]

  return (
    <div ref={pageRef} style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {locale === 'fr' ? 'Rapports & Documents' : 'Reports & Documents'}
        </h1>
        <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
          {locale === 'fr' ? 'Génération de PDF et statistiques' : 'PDF generation and statistics'}
        </p>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Stats */}
      <div
        data-animate
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDE8DF',
              borderRadius: 14,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#B5924C12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon size={16} strokeWidth={1.25} style={{ color: '#B5924C' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 22, fontWeight: 700, color: '#3D1F0F', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#5C6068', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* PDF Generator */}
      <div
        data-animate
        style={{
          background: '#FFFFFF',
          border: '1px solid #EDE8DF',
          borderRadius: 20,
          padding: '24px 28px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 26,
            fontWeight: 400,
            color: '#3D1F0F',
            marginBottom: 6,
          }}
        >
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
