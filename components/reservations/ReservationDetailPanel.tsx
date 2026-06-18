// components/reservations/ReservationDetailPanel.tsx
'use client'

import { useState } from 'react'
import { useReservation, useUpdateReservationStatus, useUpdateReservation, useDeleteReservation } from '@/lib/queries/reservations'
import { useRooms } from '@/lib/queries/rooms'
import { useHotelStore } from '@/store/hotel-store'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ApiError } from '@/lib/api/client'
import { formatDate, getNights, formatAmount } from '@/lib/utils/format'
import type { Reservation, ReservationStatus } from '@/types/hotel'
import {
  User, BedDouble, Calendar, ConciergeBell, CreditCard,
  Mail, Phone, Pencil, Check, X, Trash2, MessageCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

// API statuses in valid transition order
const API_STATUSES: { value: ReservationStatus; labelFr: string; labelEn: string; color: string }[] = [
  { value: 'confirmee', labelFr: 'Confirmée', labelEn: 'Confirmed',   color: '#1A6B4A' },
  { value: 'checkin',   labelFr: 'Arrivée',    labelEn: 'Checked in',  color: '#1558A0' },
  { value: 'terminee',  labelFr: 'Départ',     labelEn: 'Checked out', color: '#5C6068' },
  { value: 'no_show',   labelFr: 'Absent',     labelEn: 'No-show',     color: '#3D1F0F' },
  { value: 'annulee',   labelFr: 'Annulée',    labelEn: 'Cancelled',   color: '#6B1A1A' },
]

interface Props {
  reservationId: string
  /** Snapshot from list — shown immediately while detail loads */
  snapshot: Reservation
  onClose: () => void
}

export function ReservationDetailPanel({ reservationId, snapshot, onClose }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const { data: detail, isLoading } = useReservation(reservationId)
  const updateStatus = useUpdateReservationStatus()
  const updateReservation = useUpdateReservation()
  const { data: rooms = [] } = useRooms()

  const res = detail ?? snapshot

  const [nextStatus, setNextStatus] = useState<ReservationStatus>(res.status)
  const [confirmingStatus, setConfirmingStatus] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteReservation = useDeleteReservation()

  const handleDelete = async () => {
    try {
      await deleteReservation.mutateAsync(res.id)
      toast.success(locale === 'fr' ? 'Réservation supprimée' : 'Reservation deleted')
      onClose()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
      setConfirmDelete(false)
    }
  }

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    checkIn:     res.checkIn,
    checkOut:    res.checkOut,
    roomId:      res.roomId,
    totalAmount: String(res.totalAmount),
  })

  // Sync form when detail loads
  const startEdit = () => {
    setEditForm({
      checkIn:     res.checkIn,
      checkOut:    res.checkOut,
      roomId:      res.roomId,
      totalAmount: String(res.totalAmount),
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    const totalAmount = parseFloat(editForm.totalAmount)
    try {
      await updateReservation.mutateAsync({
        id:          res.id,
        checkIn:     editForm.checkIn,
        checkOut:    editForm.checkOut,
        roomId:      editForm.roomId,
        ...(isNaN(totalAmount) ? {} : { totalAmount }),
      })
      toast.success(locale === 'fr' ? 'Réservation mise à jour' : 'Reservation updated')
      setIsEditing(false)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
    }
  }

  const guest = res.guest
  const room  = res.room
  const nights = getNights(res.checkIn, res.checkOut)

  const buildWhatsAppUrl = (phone: string) => {
    const clean = phone.replace(/\D/g, '')
    const withoutPrefix = clean.replace(/^(00225|225)/, '').replace(/^0/, '')
    const intl = `+225${withoutPrefix}`
    const checkInFmt  = new Date(res.checkIn).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const checkOutFmt = new Date(res.checkOut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const roomLabel   = room ? `Chambre ${room.number} (${room.type})` : `Chambre #${res.roomId}`
    const msg = [
      `🏨 *Hôtel PMS*`,
      `Bonjour ${guest?.firstName ?? ''},`,
      ``,
      `✅ *Réservation confirmée*`,
      `🛏 ${roomLabel}`,
      `📅 Arrivée : ${checkInFmt}`,
      `📅 Départ : ${checkOutFmt}`,
      `💰 Total : ${formatAmount(res.totalAmount, res.currency)}`,
      ``,
      `Merci de votre confiance. 🙏`,
    ].join('\n')
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`
  }

  const handleStatusApply = async () => {
    try {
      await updateStatus.mutateAsync({ id: res.id, status: nextStatus })
      toast.success(locale === 'fr' ? 'Statut mis à jour' : 'Status updated')
      setConfirmingStatus(false)
      // stay in drawer — data refreshes via invalidateQueries
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
    }
  }

  const row = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ color: '#B5924C', flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#3D1F0F' }}>{value}</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '4px 0' }}>
      {isLoading && (
        <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B5924C', display: 'inline-block', animation: 'pulse 1s infinite' }} />
          {locale === 'fr' ? 'Chargement du détail…' : 'Loading detail…'}
        </div>
      )}

      {/* Status badge + ID */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {locale === 'fr' ? 'Réservation' : 'Reservation'}
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: '#5C6068' }}>
            #{res.id.slice(0, 8)}…
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={res.status} locale={locale} />
          {!isEditing && (
            <button
              onClick={startEdit}
              title={locale === 'fr' ? 'Modifier' : 'Edit'}
              style={{
                padding: '5px 8px', background: 'transparent', color: '#5C6068',
                border: '1px solid #EDE8DF', borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              }}
            >
              <Pencil size={12} strokeWidth={1.5} />
              {locale === 'fr' ? 'Modifier' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div style={{
          background: '#FAF7F2', border: '1px solid #B5924C', borderRadius: 12,
          padding: '16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#B5924C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            {locale === 'fr' ? 'Modifier la réservation' : 'Edit reservation'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 4 }}>{locale === 'fr' ? 'Arrivée' : 'Check-in'}</label>
                <input type="date" value={editForm.checkIn} onChange={(e) => setEditForm((f) => ({ ...f, checkIn: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 13, color: '#3D1F0F', background: '#FFF', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 4 }}>{locale === 'fr' ? 'Départ' : 'Check-out'}</label>
                <input type="date" value={editForm.checkOut} onChange={(e) => setEditForm((f) => ({ ...f, checkOut: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 13, color: '#3D1F0F', background: '#FFF', boxSizing: 'border-box' as const }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {locale === 'fr' ? 'Chambre' : 'Room'}
              </label>
              <select
                value={editForm.roomId}
                onChange={(e) => setEditForm((f) => ({ ...f, roomId: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 13, color: '#3D1F0F', background: '#FFF', boxSizing: 'border-box' as const }}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.number} — {r.type} ({locale === 'fr' ? 'Étage' : 'Floor'} {r.floor})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {locale === 'fr' ? 'Montant total' : 'Total amount'} ({res.currency})
              </label>
              <input
                type="number" min={0} value={editForm.totalAmount}
                onChange={(e) => setEditForm((f) => ({ ...f, totalAmount: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 13, color: '#3D1F0F', background: '#FFF', boxSizing: 'border-box' as const }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              onClick={handleSave}
              disabled={updateReservation.isPending}
              style={{
                flex: 1, padding: '8px 0',
                background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2',
                border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Check size={13} />
              {locale === 'fr' ? 'Enregistrer' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 14px', background: 'transparent', color: '#5C6068',
                border: '1px solid #EDE8DF', borderRadius: 9, cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Guest section */}
      <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          <User size={11} style={{ display: 'inline', marginRight: 5, color: '#B5924C' }} />
          {locale === 'fr' ? 'Client' : 'Guest'}
        </div>
        {guest ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#3D1F0F' }}>
              {guest.firstName} {guest.lastName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {row(<Mail size={12} />, 'Email', guest.email)}
              {guest.phone && row(<Phone size={12} />, locale === 'fr' ? 'Téléphone' : 'Phone', guest.phone)}
            </div>
            {guest.phone && (
              <a
                href={buildWhatsAppUrl(guest.phone)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 14px', borderRadius: 9,
                  background: '#25D366', color: '#FFFFFF',
                  fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                {locale === 'fr' ? 'Envoyer le reçu WhatsApp' : 'Send receipt via WhatsApp'}
              </a>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#5C6068', fontStyle: 'italic' }}>
            {locale === 'fr' ? 'Données client non disponibles' : 'Guest data not available'}
          </div>
        )}
      </div>

      {/* Room + Dates section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <BedDouble size={11} style={{ display: 'inline', marginRight: 5, color: '#B5924C' }} />
            {locale === 'fr' ? 'Chambre' : 'Room'}
          </div>
          {room ? (
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 22, fontWeight: 700, color: '#B5924C' }}>
                {room.number}
              </div>
              <div style={{ fontSize: 11, color: '#5C6068', marginTop: 2 }}>
                {room.type} · {locale === 'fr' ? 'Étage' : 'Floor'} {room.floor}
              </div>
              <div style={{ fontSize: 11, color: '#5C6068' }}>
                {formatAmount(room.basePrice, room.currency)} / {locale === 'fr' ? 'nuit' : 'night'}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 14, color: '#3D1F0F' }}>#{res.roomId}</div>
          )}
        </div>

        <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <Calendar size={11} style={{ display: 'inline', marginRight: 5, color: '#B5924C' }} />
            {locale === 'fr' ? 'Séjour' : 'Stay'}
          </div>
          <div style={{ fontSize: 12, color: '#3D1F0F' }}>
            <div>{formatDate(res.checkIn, locale)}</div>
            <div style={{ color: '#5C6068', fontSize: 10, margin: '2px 0' }}>→</div>
            <div>{formatDate(res.checkOut, locale)}</div>
          </div>
          <div style={{
            marginTop: 8, display: 'inline-block',
            background: '#B5924C18', borderRadius: 6, padding: '3px 8px',
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, fontWeight: 700, color: '#B5924C',
          }}>
            {nights} {locale === 'fr' ? 'nuit(s)' : 'night(s)'}
          </div>
        </div>
      </div>

      {/* Services */}
      {res.services && res.services.length > 0 && (
        <div style={{ background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <ConciergeBell size={11} style={{ display: 'inline', marginRight: 5, color: '#B5924C' }} />
            {locale === 'fr' ? 'Services' : 'Services'} ({res.services.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {res.services.map((si, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#3D1F0F' }}>
                  {locale === 'fr' ? si.service.name : (si.service.nameEn || si.service.name)}
                  {si.quantity > 1 && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#5C6068' }}>×{si.quantity}</span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: '#B5924C' }}>
                  {formatAmount(si.service.unitPrice * si.quantity, si.service.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#3D1F0F08', border: '1px solid #EDE8DF', borderRadius: 12,
        padding: '12px 16px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={14} style={{ color: '#B5924C' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>
            {locale === 'fr' ? 'Total' : 'Total'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color: '#B5924C' }}>
          {formatAmount(res.totalAmount, res.currency)}
        </div>
      </div>

      {/* Status updater */}
      <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          {locale === 'fr' ? 'Transition de statut' : 'Status transition'}
        </div>

        {/* Current → arrow → target */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <StatusBadge status={res.status} locale={locale} />
          <span style={{ fontSize: 18, color: '#B5924C' }}>→</span>
          <StatusBadge status={nextStatus} locale={locale} />
        </div>

        {/* Status chips — only the 4 real API statuses */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {API_STATUSES.map(({ value, labelFr, labelEn, color }) => {
            const isActive  = nextStatus === value
            const isCurrent = res.status === value
            return (
              <button
                key={value}
                onClick={() => setNextStatus(value)}
                disabled={isCurrent}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? color : '#EDE8DF'}`,
                  background: isActive ? `${color}18` : '#FFFFFF',
                  color: isCurrent ? '#B5B5B5' : isActive ? color : '#5C6068',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: isCurrent ? 'not-allowed' : 'pointer',
                  transition: 'all 0.12s',
                  position: 'relative' as const,
                }}
              >
                {locale === 'fr' ? labelFr : labelEn}
                {isCurrent && (
                  <span style={{ marginLeft: 4, fontSize: 10, color: '#B5B5B5' }}>✔</span>
                )}
              </button>
            )
          })}
        </div>

        {confirmingStatus ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleStatusApply}
              disabled={updateStatus.isPending}
              style={{
                flex: 1, padding: '9px 0',
                background: 'linear-gradient(135deg, #B5924C, #D4AF72)', color: '#FAF7F2',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: updateStatus.isPending ? 0.7 : 1,
              }}
            >
              <Check size={13} />
              {updateStatus.isPending
                ? (locale === 'fr' ? 'En cours…' : 'Updating…')
                : (locale === 'fr' ? 'Confirmer' : 'Confirm')}
            </button>
            <button
              onClick={() => setConfirmingStatus(false)}
              style={{
                padding: '9px 14px', background: 'transparent', color: '#5C6068',
                border: '1px solid #EDE8DF', borderRadius: 10, cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingStatus(true)}
            disabled={nextStatus === res.status}
            style={{
              width: '100%', padding: '9px 0',
              background: nextStatus === res.status
                ? '#EDE8DF'
                : 'linear-gradient(135deg, #B5924C, #D4AF72)',
              color: nextStatus === res.status ? '#5C6068' : '#FAF7F2',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: nextStatus === res.status ? 'not-allowed' : 'pointer',
            }}
          >
            {locale === 'fr' ? 'Appliquer le statut' : 'Apply status'}
          </button>
        )}
      </div>

      {/* Danger zone — delete */}
      <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 16, marginTop: 4 }}>
        {confirmDelete ? (
          <div style={{
            background: '#FFF1F0', border: '1px solid #FFCCC7', borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 13, color: '#5C1A1A', fontWeight: 600, marginBottom: 10 }}>
              {locale === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?'}
            </div>
            <div style={{ fontSize: 12, color: '#7A3A3A', marginBottom: 14 }}>
              {locale === 'fr'
                ? 'Cette action est irréversible.'
                : 'This action cannot be undone.'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDelete}
                disabled={deleteReservation.isPending}
                style={{
                  flex: 1, padding: '8px 0',
                  background: '#D4281C', color: '#FFF',
                  border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  opacity: deleteReservation.isPending ? 0.7 : 1,
                }}
              >
                <Trash2 size={13} />
                {deleteReservation.isPending
                  ? (locale === 'fr' ? 'Suppression…' : 'Deleting…')
                  : (locale === 'fr' ? 'Supprimer' : 'Delete')}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: '8px 14px', background: 'transparent', color: '#5C6068',
                  border: '1px solid #EDE8DF', borderRadius: 9, cursor: 'pointer',
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              width: '100%', padding: '8px 0',
              background: 'transparent', color: '#D4281C',
              border: '1px solid #FFCCC7', borderRadius: 10,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.12s',
            }}
          >
            <Trash2 size={13} />
            {locale === 'fr' ? 'Supprimer la réservation' : 'Delete reservation'}
          </button>
        )}
      </div>
    </div>
  )
}
