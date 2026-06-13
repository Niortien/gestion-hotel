// components/rapports/PdfReceiptDocument.tsx
'use client'

import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'
import type { Reservation, Guest, Room } from '@/types/hotel'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#3D1F0F',
    backgroundColor: '#FAF7F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#B5924C',
    paddingBottom: 12,
  },
  hotel: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#B5924C',
  },
  label: { fontSize: 8, color: '#5C6068', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#3D1F0F' },
  section: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  mono: { fontFamily: 'Courier', fontSize: 10 },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#B5924C',
  },
  totalText: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#B5924C' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#EDE8DF', marginVertical: 8 },
  footer: { marginTop: 32, fontSize: 8, color: '#5C6068', textAlign: 'center' },
})

interface Props {
  reservation: Reservation
  guest: Guest
  room: Room
  locale?: 'fr' | 'en'
}

export function PdfReceiptDocument({ reservation, guest, room, locale = 'fr' }: Props) {
  const nights = getNights(reservation.checkIn, reservation.checkOut)
  const roomTotal = room.basePrice * nights
  const servicesTotal = reservation.services.reduce((acc, s) => acc + s.service.unitPrice * s.quantity, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hotel}>Grand Hôtel Contemporain</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>1 Avenue de la Paix, 75001 Paris</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>+33 1 42 00 00 00 · contact@grandhotel.fr</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#3D1F0F' }}>
              {locale === 'fr' ? 'REÇU' : 'RECEIPT'} #{reservation.id.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 9, color: '#5C6068', marginTop: 4 }}>
              {locale === 'fr' ? 'Émis le' : 'Issued'} {formatDate(new Date().toISOString().slice(0, 10), locale)}
            </Text>
          </View>
        </View>

        {/* Guest */}
        <View style={styles.section}>
          <Text style={styles.label}>{locale === 'fr' ? 'Client' : 'Guest'}</Text>
          <Text style={styles.value}>{guest.firstName} {guest.lastName}</Text>
          <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.email} · {guest.phone}</Text>
        </View>

        <View style={styles.divider} />

        {/* Stay details */}
        <View style={styles.section}>
          <Text style={styles.label}>{locale === 'fr' ? 'Séjour' : 'Stay'}</Text>
          <View style={styles.row}>
            <Text>{locale === 'fr' ? 'Chambre' : 'Room'} {room.number} – {room.type}</Text>
            <Text style={styles.mono}>{formatDate(reservation.checkIn, locale)} → {formatDate(reservation.checkOut, locale)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>{nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'} × {formatAmount(room.basePrice, room.currency)}</Text>
            <Text style={styles.mono}>{formatAmount(roomTotal, reservation.currency)}</Text>
          </View>
        </View>

        {/* Services */}
        {reservation.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>{locale === 'fr' ? 'Services' : 'Services'}</Text>
            {reservation.services.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ color: '#5C6068' }}>
                  {locale === 'fr' ? item.service.name : item.service.nameEn} × {item.quantity}
                </Text>
                <Text style={styles.mono}>{formatAmount(item.service.unitPrice * item.quantity, reservation.currency)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalLine}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>{formatAmount(reservation.totalAmount, reservation.currency)}</Text>
        </View>
        {reservation.paidAmount > 0 && (
          <View style={[styles.row, { marginTop: 4 }]}>
            <Text style={{ color: '#5C6068' }}>{locale === 'fr' ? 'Payé' : 'Paid'}</Text>
            <Text style={styles.mono}>{formatAmount(reservation.paidAmount, reservation.currency)}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Grand Hôtel Contemporain · SIRET 123 456 789 00010 · TVA FR 12 345678901
          {'\n'}
          {locale === 'fr' ? 'Merci de votre confiance.' : 'Thank you for your trust.'}
        </Text>
      </Page>
    </Document>
  )
}
