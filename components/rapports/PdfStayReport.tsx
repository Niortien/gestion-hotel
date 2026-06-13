// components/rapports/PdfStayReport.tsx
'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Reservation, Guest, Room } from '@/types/hotel'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#3D1F0F',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    backgroundColor: '#3D1F0F',
    padding: '14 20',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: { fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#D4AF72' },
  docTitle:  { fontSize: 10, color: '#EDE8DF', textTransform: 'uppercase', letterSpacing: 2 },
  label:  { fontSize: 8, color: '#5C6068', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  value:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#3D1F0F' },
  card: {
    backgroundColor: '#FAF7F2',
    borderLeftWidth: 3,
    borderLeftColor: '#B5924C',
    padding: '10 14',
    marginBottom: 14,
  },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#EDE8DF', marginVertical: 10 },
  statusBadge: {
    backgroundColor: '#1A6B4A22',
    borderRadius: 99,
    padding: '2 8',
    fontSize: 9,
    color: '#1A6B4A',
    fontFamily: 'Helvetica-Bold',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#B5924C',
    marginTop: 2,
    flexShrink: 0,
  },
  footer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#EDE8DF',
    paddingTop: 10,
    fontSize: 8,
    color: '#5C6068',
    textAlign: 'center',
  },
})

interface Props {
  reservation: Reservation
  guest: Guest
  room: Room
  locale?: 'fr' | 'en'
}

export function PdfStayReport({ reservation, guest, room, locale = 'fr' }: Props) {
  const nights = getNights(reservation.checkIn, reservation.checkOut)
  const roomTotal = room.basePrice * nights
  const servicesTotal = reservation.services.reduce((acc, s) => acc + s.service.unitPrice * s.quantity, 0)

  const timeline = [
    { label: locale === 'fr' ? 'Réservation créée' : 'Reservation created', date: reservation.createdAt },
    ...(reservation.confirmedAt ? [{ label: locale === 'fr' ? 'Confirmée' : 'Confirmed', date: reservation.confirmedAt }] : []),
    { label: locale === 'fr' ? 'Arrivée' : 'Check-in', date: reservation.checkIn },
    { label: locale === 'fr' ? 'Départ' : 'Check-out', date: reservation.checkOut },
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header bar */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.hotelName}>Grand Hôtel Contemporain</Text>
            <Text style={{ fontSize: 8, color: '#EDE8DF', marginTop: 2 }}>
              1 Avenue de la Paix, 75001 Paris
            </Text>
          </View>
          <Text style={styles.docTitle}>
            {locale === 'fr' ? 'Rapport de Séjour' : 'Stay Report'}
          </Text>
        </View>

        {/* Guest + Reservation */}
        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{locale === 'fr' ? 'Client' : 'Guest'}</Text>
            <Text style={styles.value}>{guest.firstName} {guest.lastName}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.email}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>{guest.phone}</Text>
            {guest.vip && (
              <View style={[styles.statusBadge, { backgroundColor: '#B5924C22', marginTop: 4 }]}>
                <Text style={{ color: '#B5924C' }}>★ VIP</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{locale === 'fr' ? 'Chambre' : 'Room'}</Text>
            <Text style={styles.value}>{room.number} — {room.type}</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>
              {locale === 'fr' ? 'Étage' : 'Floor'} {room.floor} · {room.surface}m²
            </Text>
            {room.view && (
              <Text style={{ fontSize: 9, color: '#5C6068' }}>
                {locale === 'fr' ? 'Vue' : 'View'}: {room.view}
              </Text>
            )}
          </View>
        </View>

        {/* Stay dates */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>
              {locale === 'fr' ? 'Arrivée' : 'Check-in'}
            </Text>
            <Text style={{ fontFamily: 'Courier' }}>{formatDate(reservation.checkIn, locale)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>
              {locale === 'fr' ? 'Départ' : 'Check-out'}
            </Text>
            <Text style={{ fontFamily: 'Courier' }}>{formatDate(reservation.checkOut, locale)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>
              {locale === 'fr' ? 'Durée' : 'Duration'}
            </Text>
            <Text style={{ fontFamily: 'Courier' }}>
              {nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>
              {locale === 'fr' ? 'Voyageurs' : 'Guests'}
            </Text>
            <Text>{reservation.adults}A {reservation.children > 0 ? `+ ${reservation.children}E` : ''}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={{ marginBottom: 18 }}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Timeline</Text>
          {timeline.map((item, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                <Text style={{ color: '#3D1F0F' }}>{item.label}</Text>
                <Text style={{ fontFamily: 'Courier', color: '#5C6068' }}>
                  {formatDate(item.date, locale)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Billing summary */}
        <Text style={[styles.label, { marginBottom: 8 }]}>
          {locale === 'fr' ? 'Récapitulatif financier' : 'Financial summary'}
        </Text>
        <View style={styles.row}>
          <Text style={{ color: '#5C6068' }}>
            {locale === 'fr' ? 'Hébergement' : 'Accommodation'} ({nights}n × {formatAmount(room.basePrice, reservation.currency)})
          </Text>
          <Text style={{ fontFamily: 'Courier' }}>{formatAmount(roomTotal, reservation.currency)}</Text>
        </View>
        {reservation.services.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={{ color: '#5C6068' }}>
              {locale === 'fr' ? item.service.name : item.service.nameEn} × {item.quantity}
            </Text>
            <Text style={{ fontFamily: 'Courier' }}>{formatAmount(item.service.unitPrice * item.quantity, reservation.currency)}</Text>
          </View>
        ))}

        <View style={[styles.row, { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#B5924C' }]}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12 }}>Total</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#B5924C' }}>
            {formatAmount(reservation.totalAmount, reservation.currency)}
          </Text>
        </View>

        {reservation.paidAmount > 0 && (
          <View style={styles.row}>
            <Text style={{ color: '#5C6068' }}>{locale === 'fr' ? 'Payé' : 'Paid'}</Text>
            <Text style={{ fontFamily: 'Courier', color: '#1A6B4A' }}>{formatAmount(reservation.paidAmount, reservation.currency)}</Text>
          </View>
        )}

        {/* Notes */}
        {reservation.notes && (
          <View style={{ marginTop: 16, backgroundColor: '#FAF7F2', padding: '8 12', borderRadius: 4 }}>
            <Text style={[styles.label, { marginBottom: 4 }]}>Notes</Text>
            <Text style={{ fontSize: 9, color: '#3D1F0F', fontStyle: 'italic' }}>{reservation.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {locale === 'fr' ? 'Document généré le' : 'Generated on'} {formatDate(new Date().toISOString().slice(0, 10), locale)}
          {' · '}Grand Hôtel Contemporain · contact@grandhotel.fr
        </Text>
      </Page>
    </Document>
  )
}
