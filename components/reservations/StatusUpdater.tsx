// components/reservations/StatusUpdater.tsx
'use client'

import { useState } from 'react'
import { NativeSelect, SimpleModal } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { useUpdateReservationStatus } from '@/lib/queries/reservations'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Reservation, ReservationStatus } from '@/types/hotel'
import toast from 'react-hot-toast'

const STATUSES: ReservationStatus[] = [
  'confirmee', 'en_attente', 'terminee', 'annulee', 'no_show',
]

interface Props {
  reservation: Reservation
  onClose: () => void
}

export function StatusUpdater({ reservation, onClose }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const updateStatusMutation = useUpdateReservationStatus()
  const [next, setNext] = useState<ReservationStatus>(reservation.status)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = () => {
    updateStatusMutation.mutate({ id: reservation.id, status: next })
    toast.success(locale === 'fr' ? 'Statut mis à jour' : 'Status updated')
    setConfirmOpen(false)
    onClose()
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#5C6068' }}>
        {locale === 'fr' ? 'Statut actuel' : 'Current status'} :{' '}
        <StatusBadge status={reservation.status} locale={locale} size="sm" />
      </div>

      <NativeSelect
        label={locale === 'fr' ? 'Nouveau statut' : 'New status'}
        value={next}
        onChange={(e) => setNext(e.target.value as ReservationStatus)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </NativeSelect>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '8px 18px', fontSize: 13, color: '#5C6068', cursor: 'pointer' }}
        >
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={next === reservation.status}
          style={{
            background: next === reservation.status ? '#EDE8DF' : 'linear-gradient(135deg, #B5924C, #D4AF72)',
            color: next === reservation.status ? '#5C6068' : '#FAF7F2',
            border: 'none',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: next === reservation.status ? 'not-allowed' : 'pointer',
          }}
        >
          {locale === 'fr' ? 'Appliquer' : 'Apply'}
        </button>
      </div>

      <SimpleModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={locale === 'fr' ? 'Confirmer le changement' : 'Confirm change'}
        width={400}
      >
        <p style={{ fontSize: 13, color: '#5C6068', marginBottom: 20 }}>
          {locale === 'fr'
            ? `Changer le statut vers "${next}" ?`
            : `Change status to "${next}"?`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={() => setConfirmOpen(false)}
            style={{ background: 'transparent', border: '1px solid #EDE8DF', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#5C6068', cursor: 'pointer' }}
          >
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            style={{ background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {locale === 'fr' ? 'Confirmer' : 'Confirm'}
          </button>
        </div>
      </SimpleModal>
    </div>
  )
}
