// components/chambres/RoomDetailPanel.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { animateSlideOut } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useGuests } from '@/lib/queries/guests'
import { useReservations } from '@/lib/queries/reservations'
import { useUpdateRoomStatus, useDeleteRoom } from '@/lib/queries/rooms'
import { formatAmount } from '@/lib/utils/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { GuestTag } from '@/components/common/GuestTag'
import { RoomSettingsForm } from '@/components/parametres/RoomSettingsForm'
import { X, Users, Maximize2, Eye, BedDouble, Star, Pencil, ChevronLeft, Trash2 } from 'lucide-react'
import type { Room, RoomStatus } from '@/types/hotel'
import toast from 'react-hot-toast'

const ROOM_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  standard: { fr: 'Standard', en: 'Standard' },
  deluxe:   { fr: 'Deluxe',   en: 'Deluxe' },
  suite:    { fr: 'Suite',    en: 'Suite' },
  prestige: { fr: 'Prestige', en: 'Prestige' },
}

interface Props {
  room: Room | null
  onClose: () => void
}

export function RoomDetailPanel({ room, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { data: guests = [] } = useGuests()
  const { data: reservations = [] } = useReservations()
  const updateStatus = useUpdateRoomStatus()
  const deleteRoom = useDeleteRoom()

  const currentGuest = room?.currentGuestId
    ? guests.find((g) => g.id === room.currentGuestId)
    : null

  const currentReservation = room?.currentReservationId
    ? reservations.find((r) => r.id === room.currentReservationId)
    : null

  useEffect(() => {
    if (!panelRef.current) return
    if (room) {
      setIsEditing(false)
      setConfirmDelete(false)
      gsap.fromTo(panelRef.current, { x: '100%' }, { x: '0%', duration: 0.4, ease: 'power3.out' })
    }
  }, [room])

  const handleClose = () => {
    if (!panelRef.current) return
    animateSlideOut(panelRef.current, 'right', onClose)
  }

  if (!room) return null

  const typeLabel = locale === 'fr'
    ? ROOM_TYPE_LABELS[room.type]?.fr
    : ROOM_TYPE_LABELS[room.type]?.en

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(61,31,15,0.15)',
          backdropFilter: 'blur(2px)',
          zIndex: 99,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 400,
          height: '100dvh',
          background: '#FAF7F2',
          zIndex: 100,
          overflowY: 'auto',
          boxShadow: '-8px 0 48px rgba(61,31,15,0.15)',
          transform: 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid #EDE8DF',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 36,
                fontWeight: 700,
                color: '#3D1F0F',
                lineHeight: 1,
              }}
            >
              {room.number}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 16,
                fontStyle: 'italic',
                color: '#B5924C',
                marginTop: 4,
              }}
            >
              {typeLabel} — Étage {room.floor}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setConfirmDelete((v) => !v); setIsEditing(false) }}
              title={locale === 'fr' ? 'Supprimer' : 'Delete'}
              style={{
                background: confirmDelete ? '#8B1A2F' : '#EDE8DF',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: confirmDelete ? '#FAF7F2' : '#8B1A2F',
              }}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsEditing((v) => !v)}
              title={locale === 'fr' ? 'Modifier' : 'Edit'}
              style={{
                background: isEditing ? '#B5924C' : '#EDE8DF',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isEditing ? '#FAF7F2' : '#5C6068',
              }}
            >
              {isEditing ? <ChevronLeft size={16} strokeWidth={1.5} /> : <Pencil size={14} strokeWidth={1.5} />}
            </button>
            <button
              onClick={handleClose}
              style={{
                background: '#EDE8DF',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#5C6068',
              }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {confirmDelete ? (
            <div style={{ background: '#FFF5F5', border: '1px solid #F5C6CB', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 14, color: '#8B1A2F', fontWeight: 600, marginBottom: 6 }}>
                {locale === 'fr' ? `Supprimer la chambre ${room.number} ?` : `Delete room ${room.number}?`}
              </p>
              <p style={{ fontSize: 12, color: '#5C6068', marginBottom: 14 }}>
                {locale === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #EDE8DF', background: '#FFFFFF', cursor: 'pointer', fontSize: 13, color: '#5C6068' }}
                >
                  {locale === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  disabled={deleteRoom.isPending}
                  onClick={async () => {
                    try {
                      await deleteRoom.mutateAsync(Number(room.id))
                      toast.success(locale === 'fr' ? 'Chambre supprimée' : 'Room deleted')
                      onClose()
                    } catch (err: unknown) {
                      const apiErr = err as { status?: number; body?: { message?: string } }
                      if (apiErr?.status === 500 || apiErr?.status === 409) {
                        toast.error(locale === 'fr'
                          ? 'Impossible : cette chambre a des réservations liées'
                          : 'Cannot delete: room has linked reservations')
                      } else {
                        const msg = apiErr?.body?.message ?? (locale === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed')
                        toast.error(String(msg))
                      }
                    }
                  }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                    background: '#8B1A2F', color: '#FFFFFF', cursor: deleteRoom.isPending ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, opacity: deleteRoom.isPending ? 0.7 : 1,
                  }}
                >
                  {deleteRoom.isPending
                    ? (locale === 'fr' ? 'Suppression...' : 'Deleting...')
                    : (locale === 'fr' ? 'Confirmer' : 'Confirm')}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <RoomSettingsForm room={room} />
          ) : (<>
          {/* Status + quick change */}
          <div>
            <StatusBadge status={room.status} locale={locale} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {(['libre', 'nettoyage', 'travaux', 'occupee'] as RoomStatus[]).map((s) => {
                const isActive = room.status === s
                return (
                  <button
                    key={s}
                    disabled={isActive || updateStatus.isPending}
                    onClick={async () => {
                      try {
                        await updateStatus.mutateAsync({ id: Number(room.id), status: s })
                        toast.success(locale === 'fr' ? 'Statut mis à jour' : 'Status updated')
                      } catch {
                        toast.error(locale === 'fr' ? 'Erreur de mise à jour' : 'Update failed')
                      }
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      border: isActive ? '2px solid #B5924C' : '1px solid #EDE8DF',
                      background: isActive ? '#FDF5E6' : '#FFFFFF',
                      cursor: isActive ? 'default' : 'pointer',
                      fontSize: 11,
                      color: isActive ? '#B5924C' : '#5C6068',
                      fontWeight: isActive ? 600 : 400,
                      opacity: updateStatus.isPending && !isActive ? 0.5 : 1,
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Key info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              { icon: Users,     label: locale === 'fr' ? 'Capacité' : 'Capacity',  value: `${room.capacity} pers.` },
              { icon: Maximize2, label: 'Surface',                                   value: `${room.surface} m²` },
              { icon: Eye,       label: locale === 'fr' ? 'Vue' : 'View',            value: room.view },
              { icon: BedDouble, label: locale === 'fr' ? 'Prix de base' : 'Rate',   value: `${formatAmount(room.basePrice, room.currency)}/nuit` },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: '12px 14px',
                  border: '1px solid #EDE8DF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={13} strokeWidth={1.25} style={{ color: '#B5924C' }} />
                  <span style={{ fontSize: 11, color: '#5C6068' }}>{label}</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#3D1F0F',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 6 }}>
              {locale === 'fr' ? 'Description' : 'Description'}
            </div>
            <p style={{ fontSize: 13, color: '#3D1F0F', lineHeight: 1.6, fontStyle: 'italic' }}>
              {locale === 'fr' ? room.description : room.descriptionEn}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={12} strokeWidth={1.25} style={{ color: '#B5924C' }} />
              {locale === 'fr' ? 'Équipements' : 'Amenities'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {room.amenities.map((a) => (
                <span
                  key={a}
                  style={{
                    padding: '3px 10px',
                    background: '#EDE8DF',
                    borderRadius: 99,
                    fontSize: 11,
                    color: '#5C6068',
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Current guest */}
          {currentGuest && (
            <div>
              <div style={{ fontSize: 12, color: '#5C6068', marginBottom: 8 }}>
                {locale === 'fr' ? 'Client actuel' : 'Current guest'}
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid #EDE8DF',
                }}
              >
                <GuestTag guest={currentGuest} />
                {currentReservation && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#5C6068' }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {currentReservation.checkIn} → {currentReservation.checkOut}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last cleaned */}
          {room.lastCleaned && (
            <div style={{ fontSize: 12, color: '#5C6068' }}>
              {locale === 'fr' ? 'Dernier nettoyage' : 'Last cleaned'} :{' '}
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#3D1F0F' }}>
                {room.lastCleaned.slice(0, 16).replace('T', ' ')}
              </span>
            </div>
          )}
          </>)}
        </div>
      </div>
    </>
  )
}
