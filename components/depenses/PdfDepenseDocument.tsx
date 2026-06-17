// components/depenses/PdfDepenseDocument.tsx
'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ApiDepense, ApiDepenseCategorie } from '@/lib/api/types'
import { formatAmount } from '@/lib/utils/format'

const CATEGORIE_LABELS: Record<ApiDepenseCategorie, string> = {
  FOURNITURES: 'Fournitures',
  ALIMENTATION: 'Alimentation',
  ENTRETIEN: 'Entretien & Maintenance',
  SALAIRES: 'Salaires & Charges',
  SERVICES: 'Services Externes',
  EQUIPEMENT: 'Équipement',
  AUTRE: 'Autre',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    color: '#3D1F0F',
    backgroundColor: '#FFFFFF',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  logo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#B5924C' },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#3D1F0F', textAlign: 'right' },
  subTitle: { fontSize: 10, color: '#5C6068', textAlign: 'right' },
  label: { fontSize: 7, color: '#5C6068', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 },
  value: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  infoRow: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  infoBlock: { flex: 1 },
  divider: { borderTopWidth: 1, borderTopColor: '#EDE8DF', marginVertical: 16 },
  amountBox: {
    backgroundColor: '#3D1F0F',
    padding: '16 20',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  amountLabel: { color: '#FAF7F2', fontFamily: 'Helvetica-Bold', fontSize: 13 },
  amountValue: { color: '#D4AF72', fontFamily: 'Helvetica-Bold', fontSize: 18 },
  noteBox: { backgroundColor: '#FAF7F2', padding: '10 14', borderRadius: 4, marginTop: 12 },
  footer: { marginTop: 48, borderTopWidth: 1, borderTopColor: '#EDE8DF', paddingTop: 12, fontSize: 8, color: '#5C6068' },
})

interface Props {
  depense: ApiDepense
  numero?: string
}

export function PdfDepenseDocument({ depense, numero }: Props) {
  const dateStr = new Date(depense.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const createdStr = new Date(depense.createdAt).toLocaleDateString('fr-FR')
  const ref = numero ?? `DEP-${depense.id.slice(0, 8).toUpperCase()}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Grand Hôtel PMS</Text>
            <Text style={{ fontSize: 9, color: '#5C6068', marginTop: 4 }}>Système de gestion hôtelière</Text>
            <Text style={{ fontSize: 9, color: '#5C6068' }}>Côte d'Ivoire</Text>
          </View>
          <View>
            <Text style={styles.title}>BON DE DÉPENSE</Text>
            <Text style={styles.subTitle}>Réf. {ref}</Text>
            <Text style={[styles.subTitle, { marginTop: 3 }]}>Émis le : {createdStr}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Libellé</Text>
            <Text style={styles.value}>{depense.libelle}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Catégorie</Text>
            <Text style={styles.value}>{CATEGORIE_LABELS[depense.categorie] ?? depense.categorie}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Date de la dépense</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          {depense.createdBy && (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Enregistré par</Text>
              <Text style={styles.value}>{depense.createdBy}</Text>
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Montant total</Text>
          <Text style={styles.amountValue}>{formatAmount(Number(depense.montant), 'FCFA')}</Text>
        </View>

        {/* Note */}
        {depense.note && (
          <View style={styles.noteBox}>
            <Text style={[styles.label, { marginBottom: 5 }]}>Note</Text>
            <Text style={{ fontSize: 10, color: '#3D1F0F' }}>{depense.note}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Document généré automatiquement par le système PMS — Grand Hôtel</Text>
          <Text style={{ marginTop: 3 }}>
            Réf. {ref} · {depense.libelle} · {formatAmount(Number(depense.montant), 'FCFA')} · {dateStr}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
