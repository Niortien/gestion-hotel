// components/rapports/PdfInvoiceDocument.tsx
'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Reservation, Guest, Room } from '@/types/hotel'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'

const VAT_RATE = 0.20

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    color: '#3D1F0F',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  logo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#B5924C' },
  invoiceTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#3D1F0F', textAlign: 'right' },
  invoiceNum: { fontSize: 10, color: '#5C6068', textAlign: 'right' },
  section: { marginBottom: 20 },
  label: { fontSize: 7, color: '#5C6068', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 },
  value: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3D1F0F',
    color: '#FAF7F2',
    padding: '6 10',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7 10',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8DF',
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  subtotalArea: { alignItems: 'flex-end', marginTop: 12 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4, width: 250 },
  subtotalLabel: { flex: 1, color: '#5C6068', fontSize: 10 },
  subtotalValue: { fontFamily: 'Courier', fontSize: 10 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 250,
    backgroundColor: '#3D1F0F',
    padding: '7 10',
    borderRadius: 4,
    marginTop: 4,
  },
  totalLabel: { flex: 1, color: '#FAF7F2', fontFamily: 'Helvetica-Bold', fontSize: 12 },
  totalValue: { color: '#D4AF72', fontFamily: 'Helvetica-Bold', fontSize: 12 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#EDE8DF', paddingTop: 12, fontSize: 8, color: '#5C6068' },
  rib: { marginTop: 12, backgroundColor: '#FAF7F2', padding: '8 10', borderRadius: 4, fontSize: 8 },
})

interface Props {
  reservation: Reservation
  guest: Guest
  room: Room
  invoiceNumber: string
  locale?: 'fr' | 'en'
}

export function PdfInvoiceDocument({ reservation, guest, room, invoiceNumber, locale = 'fr' }: Props) {
  const nights = getNights(reservation.checkIn, reservation.checkOut)
  const roomHT = room.basePrice * nights
  const servicesHT = reservation.services.reduce((acc, s) => acc + s.service.unitPrice * s.quantity, 0)
  const totalHT = roomHT + servicesHT
  const vatAmount = totalHT * VAT_RATE
  const totalTTC = totalHT + vatAmount

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Grand Hôtel Contemporain</Text>
            <Text style={{ fontSize: 9, color: '#5C6068', marginTop: 4 }}>1 Avenue de la Paix</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>75001 Paris, France</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>SIRET : 123 456 789 00010</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>TVA : FR 12 345678901</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>{locale === 'fr' ? 'FACTURE' : 'INVOICE'}</Text>
            <Text style={styles.invoiceNum}>N° {invoiceNumber}</Text>
            <Text style={[styles.invoiceNum, { marginTop: 3 }]}>
              {locale === 'fr' ? 'Date : ' : 'Date: '}{formatDate(today, locale)}
            </Text>
          </View>
        </View>

        {/* Bill to */}
        <View style={{ flexDirection: 'row', gap: 40, marginBottom: 28 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{locale === 'fr' ? 'Facturé à' : 'Bill to'}</Text>
            <Text style={styles.value}>{guest.firstName} {guest.lastName}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.email}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.phone}</Text>
            {guest.address && <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.address}, {guest.city}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{locale === 'fr' ? 'Détails du séjour' : 'Stay details'}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>
              {formatDate(reservation.checkIn, locale)} → {formatDate(reservation.checkOut, locale)}
            </Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>
              {nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'} · {reservation.adults} {locale === 'fr' ? 'adulte(s)' : 'adult(s)'}
            </Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>{locale === 'fr' ? 'Désignation' : 'Description'}</Text>
          <Text style={styles.col2}>{locale === 'fr' ? 'Qté' : 'Qty'}</Text>
          <Text style={styles.col3}>{locale === 'fr' ? 'P.U. HT' : 'Unit Price'}</Text>
          <Text style={styles.col4}>{locale === 'fr' ? 'Total HT' : 'Total'}</Text>
        </View>

        {/* Room line */}
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            {locale === 'fr' ? 'Hébergement' : 'Accommodation'} — Ch. {room.number} ({room.type})
          </Text>
          <Text style={styles.col2}>{nights}</Text>
          <Text style={[styles.col3, { fontFamily: 'Courier' }]}>{formatAmount(room.basePrice, reservation.currency)}</Text>
          <Text style={[styles.col4, { fontFamily: 'Courier' }]}>{formatAmount(roomHT, reservation.currency)}</Text>
        </View>

        {/* Services */}
        {reservation.services.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{locale === 'fr' ? item.service.name : item.service.nameEn}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={[styles.col3, { fontFamily: 'Courier' }]}>{formatAmount(item.service.unitPrice, reservation.currency)}</Text>
            <Text style={[styles.col4, { fontFamily: 'Courier' }]}>{formatAmount(item.service.unitPrice * item.quantity, reservation.currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.subtotalArea}>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>{locale === 'fr' ? 'Sous-total HT' : 'Subtotal'}</Text>
            <Text style={styles.subtotalValue}>{formatAmount(totalHT, reservation.currency)}</Text>
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>TVA 20%</Text>
            <Text style={styles.subtotalValue}>{formatAmount(vatAmount, reservation.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{locale === 'fr' ? 'Total TTC' : 'Total incl. VAT'}</Text>
            <Text style={styles.totalValue}>{formatAmount(totalTTC, reservation.currency)}</Text>
          </View>
        </View>

        {/* RIB */}
        <View style={styles.rib}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
            {locale === 'fr' ? 'Coordonnées bancaires' : 'Banking details'}
          </Text>
          <Text>IBAN : FR76 3000 6000 0112 3456 7890 189</Text>
          <Text>BIC : BNPAFRPPXXX</Text>
          <Text>Banque : BNP Paribas — Grand Hôtel Contemporain</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{locale === 'fr' ? 'Merci de votre confiance.' : 'Thank you for your business.'}</Text>
          <Text style={{ marginTop: 4 }}>
            Grand Hôtel Contemporain · 1 Avenue de la Paix, 75001 Paris · +33 1 42 00 00 00 · contact@grandhotel.fr
          </Text>
        </View>
      </Page>
    </Document>
  )
}
