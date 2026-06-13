// components/rapports/ReportSelector.tsx
'use client'

import { useState, lazy, Suspense } from 'react'
import { NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useReservations } from '@/lib/queries/reservations'
import { useGuests } from '@/lib/queries/guests'
import { useRooms } from '@/lib/queries/rooms'
import { PdfReceiptDocument } from './PdfReceiptDocument'
import { PdfInvoiceDocument } from './PdfInvoiceDocument'
import { PdfStayReport } from './PdfStayReport'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { formatInvoiceNumber, formatAmount } from '@/lib/utils/format'
import { Download, FileText, Receipt, FileBarChart } from 'lucide-react'

import type { Reservation } from '@/types/hotel'

type DocType = 'receipt' | 'invoice' | 'report'

export function ReportSelector() {
  const locale = useHotelStore((s) => s.locale)
  const { data: reservations = [] } = useReservations()
  const { data: guests = [] } = useGuests()
  const { data: rooms = [] } = useRooms()

  const [selectedResId, setSelectedResId] = useState<string>('')
  const [docType, setDocType] = useState<DocType>('receipt')

  const reservation = reservations.find((r) => r.id === selectedResId)
  const guest = reservation ? guests.find((g) => g.id === reservation.guestId) : undefined
  const room  = reservation ? rooms.find((r) => r.id === reservation.roomId) : undefined

  const canGenerate = !!(reservation && guest && room)

  const docTypeOptions: { value: DocType; label: string; icon: typeof Receipt }[] = [
    { value: 'receipt', label: locale === 'fr' ? 'Reçu'           : 'Receipt',    icon: Receipt },
    { value: 'invoice', label: locale === 'fr' ? 'Facture'        : 'Invoice',    icon: FileText },
    { value: 'report',  label: locale === 'fr' ? 'Rapport séjour' : 'Stay report', icon: FileBarChart },
  ]

  const invoiceNumber = reservation ? formatInvoiceNumber(reservation.id) : ''

  const getDocument = () => {
    if (!reservation || !guest || !room) return null
    switch (docType) {
      case 'receipt': return <PdfReceiptDocument reservation={reservation} guest={guest} room={room} locale={locale} />
      case 'invoice': return <PdfInvoiceDocument reservation={reservation} guest={guest} room={room} invoiceNumber={invoiceNumber} locale={locale} />
      case 'report':  return <PdfStayReport reservation={reservation} guest={guest} room={room} locale={locale} />
    }
  }

  const getFileName = () => {
    const base = `${guest?.lastName ?? 'guest'}-${reservation?.id ?? ''}`
    switch (docType) {
      case 'receipt': return `recu-${base}.pdf`
      case 'invoice': return `facture-${invoiceNumber}.pdf`
      case 'report':  return `rapport-sejour-${base}.pdf`
    }
  }

  return (
    <div>
      {/* Doc type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {docTypeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setDocType(value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 12,
              border: `1px solid ${docType === value ? '#B5924C' : '#EDE8DF'}`,
              background: docType === value ? '#B5924C18' : '#FFFFFF',
              color: docType === value ? '#B5924C' : '#5C6068',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: docType === value ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} strokeWidth={1.25} />
            {label}
          </button>
        ))}
      </div>

      {/* Reservation selector */}
      <div style={{ marginBottom: 20 }}>
        <NativeSelect
          label={locale === 'fr' ? 'Sélectionner une réservation' : 'Select a reservation'}
          value={selectedResId}
          onChange={(e) => setSelectedResId(e.target.value)}
        >
          <option value="">--</option>
          {reservations.map((res) => {
            const g = guests.find((g) => g.id === res.guestId)
            const r = rooms.find((r) => r.id === res.roomId)
            return (
              <option key={res.id} value={res.id}>
                {g?.firstName} {g?.lastName} — Ch. {r?.number} ({res.checkIn})
              </option>
            )
          })}
        </NativeSelect>
      </div>

      {/* Selected reservation preview */}
      {canGenerate && (
        <div
          style={{
            background: '#FAF7F2',
            border: '1px solid #EDE8DF',
            borderLeft: '3px solid #B5924C',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F', marginBottom: 4 }}>
            {guest!.firstName} {guest!.lastName}
            {guest!.vip && (
              <span style={{ marginLeft: 8, color: '#B5924C', fontSize: 11 }}>★ VIP</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#5C6068' }}>
            <span>Chambre {room!.number}</span>
            <span>{reservation!.checkIn} → {reservation!.checkOut}</span>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#B5924C', fontWeight: 700 }}>
              {formatAmount(reservation!.totalAmount, reservation!.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Download button */}
      {canGenerate ? (
        <Suspense fallback={<span style={{ fontSize: 12, color: '#5C6068' }}>Chargement…</span>}>
          <PDFDownloadLink
            document={getDocument()!}
            fileName={getFileName()}
            style={{ textDecoration: 'none' }}
          >
            {({ loading, error }) => (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 24px',
                  background: loading
                    ? '#EDE8DF'
                    : 'linear-gradient(135deg, #B5924C, #D4AF72)',
                  color: loading ? '#5C6068' : '#FAF7F2',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 2px 12px rgba(181,146,76,0.2)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? (
                  <span style={{ fontSize: 12 }}>…</span>
                ) : (
                  <Download size={15} strokeWidth={1.5} />
                )}
                {loading
                  ? (locale === 'fr' ? 'Génération…' : 'Generating…')
                  : (locale === 'fr' ? 'Télécharger le PDF' : 'Download PDF')}
              </div>
            )}
          </PDFDownloadLink>
        </Suspense>
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 24px',
            background: '#EDE8DF',
            color: '#5C6068',
            borderRadius: 10,
            fontSize: 13,
            cursor: 'not-allowed',
          }}
        >
          <Download size={15} strokeWidth={1.5} />
          {locale === 'fr' ? 'Sélectionnez une réservation' : 'Select a reservation'}
        </div>
      )}
    </div>
  )
}
