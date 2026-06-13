// components/clients/GuestProfile.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { useHotelStore } from '@/store/hotel-store'
import { useUpdateGuest, useDeleteGuest, useGuest } from '@/lib/queries/guests'
import { GuestTag } from '@/components/common/GuestTag'
import { StayHistory } from './StayHistory'
import type { Guest } from '@/types/hotel'
import {
  Mail, Phone, MapPin, Globe, Hash, Crown, StickyNote,
  TrendingUp, BedDouble, Pencil, X, Check, Trash2,
} from 'lucide-react'
import { formatAmount } from '@/lib/utils/format'
import toast from 'react-hot-toast'

interface Props {
  guest: Guest
  isExpanded: boolean
  onToggle: () => void
}

export function GuestProfile({ guest, isExpanded, onToggle }: Props) {
  const locale = useHotelStore((s) => s.locale)
  const expandRef = useRef<HTMLDivElement>(null)
  const updateGuest = useUpdateGuest()
  const deleteGuest = useDeleteGuest()
  const { data: detail } = useGuest(guest.id)

  // Use fresh detail data when available, fall back to list data
  const g = detail ?? guest

  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    firstName: guest.firstName,
    lastName:  guest.lastName,
    email:     guest.email,
    phone:     guest.phone,
  })

  useEffect(() => {
    if (!expandRef.current) return
    if (isExpanded) {
      gsap.fromTo(
        expandRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
      )
    } else {
      gsap.to(expandRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      })
      setIsEditing(false)
    }
  }, [isExpanded])

  const handleDelete = async () => {
    try {
      await deleteGuest.mutateAsync(guest.id)
      toast.success(locale === 'fr' ? 'Client supprimé' : 'Guest deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur de suppression' : 'Delete failed'))
      setConfirmDelete(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateGuest.mutateAsync({ id: guest.id, ...form })
      setIsEditing(false)
      toast.success(locale === 'fr' ? 'Client mis à jour' : 'Guest updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur de mise à jour' : 'Update failed'))
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #EDE8DF',
    borderRadius: 8,
    fontSize: 12,
    color: '#3D1F0F',
    padding: '6px 10px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: isExpanded ? '1px solid #D4AF72' : '1px solid #EDE8DF',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        boxShadow: isExpanded ? '0 4px 24px rgba(181,146,76,0.1)' : '0 2px 8px rgba(61,31,15,0.04)',
      }}
    >
      {/* Header row — always visible */}
      <div
        onClick={onToggle}
        style={{
          padding: '14px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <GuestTag guest={guest} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {guest.vip && (
            <span
              style={{
                background: 'linear-gradient(135deg, #B5924C18, #D4AF7218)',
                border: '1px solid #B5924C44',
                color: '#B5924C',
                borderRadius: 99,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Crown size={10} strokeWidth={1.5} />
              VIP
            </span>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: '#5C6068',
            }}
          >
            <BedDouble size={12} strokeWidth={1.25} />
            {guest.totalStays}
          </div>

          {/* Delete button */}
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: 11, color: '#8B1A2F' }}>
                {locale === 'fr' ? 'Confirmer ?' : 'Confirm?'}
              </span>
              <button
                onClick={handleDelete}
                disabled={deleteGuest.isPending}
                style={{ background: '#8B1A2F', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#fff', opacity: deleteGuest.isPending ? 0.6 : 1 }}
              >
                {deleteGuest.isPending ? '…' : (locale === 'fr' ? 'Supprimer' : 'Delete')}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ background: 'none', border: '1px solid #EDE8DF', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#5C6068' }}
              >
                <X size={10} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: '1px solid #EDE8DF', borderRadius: 6, padding: '5px', cursor: 'pointer', color: '#8B1A2F' }}
              title={locale === 'fr' ? 'Supprimer le client' : 'Delete guest'}
            >
              <Trash2 size={12} strokeWidth={1.5} />
            </button>
          )}
          <div
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5C6068',
              transition: 'transform 0.25s',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <div
        ref={expandRef}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: '1px solid #EDE8DF',
            paddingTop: 16,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left: contact & details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {locale === 'fr' ? 'Coordonnées' : 'Contact'}
                </h4>
                {!isEditing ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setForm({ firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone }); setIsEditing(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid #EDE8DF', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#5C6068' }}
                  >
                    <Pencil size={10} strokeWidth={1.5} />
                    {locale === 'fr' ? 'Modifier' : 'Edit'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSave() }}
                      disabled={updateGuest.isPending}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1A6B4A', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#fff', opacity: updateGuest.isPending ? 0.6 : 1 }}
                    >
                      <Check size={10} strokeWidth={2} />
                      {updateGuest.isPending ? '…' : (locale === 'fr' ? 'Enregistrer' : 'Save')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid #EDE8DF', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#5C6068' }}
                    >
                      <X size={10} strokeWidth={1.5} />
                      {locale === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 3 }}>{locale === 'fr' ? 'Prénom' : 'First name'}</label>
                      <input style={inputStyle} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 3 }}>{locale === 'fr' ? 'Nom' : 'Last name'}</label>
                      <input style={inputStyle} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 3 }}>Email</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, display: 'block', marginBottom: 3 }}>{locale === 'fr' ? 'Téléphone' : 'Phone'}</label>
                    <input style={inputStyle} type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <>
                  {[
                    { icon: Mail,  label: g.email },
                    { icon: Phone, label: g.phone },
                    { icon: MapPin, label: `${g.city}, ${g.country}` },
                    { icon: Globe, label: g.nationality },
                    { icon: Hash,  label: g.idNumber },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={12} strokeWidth={1.25} style={{ color: '#B5924C', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#3D1F0F' }}>{label}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Stats */}
              <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color: '#B5924C' }}>
                    {g.totalStays}
                  </div>
                  <div style={{ fontSize: 10, color: '#5C6068' }}>{locale === 'fr' ? 'séjours' : 'stays'}</div>
                </div>
                <div style={{ width: 1, background: '#EDE8DF' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18, fontWeight: 700, color: '#B5924C' }}>
                    {formatAmount(g.totalSpent, 'FCFA')}
                  </div>
                  <div style={{ fontSize: 10, color: '#5C6068' }}>{locale === 'fr' ? 'dépensé' : 'spent'}</div>
                </div>
                {g.lastStay && (
                  <>
                    <div style={{ width: 1, background: '#EDE8DF' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, fontWeight: 700, color: '#B5924C' }}>
                        {g.lastStay.slice(0, 10)}
                      </div>
                      <div style={{ fontSize: 10, color: '#5C6068' }}>{locale === 'fr' ? 'dernier séjour' : 'last stay'}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              {g.notes && (
                <div
                  style={{
                    background: '#FAF7F2',
                    border: '1px solid #EDE8DF',
                    borderRadius: 8,
                    padding: '8px 10px',
                    marginTop: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <StickyNote size={11} strokeWidth={1.25} style={{ color: '#B5924C' }} />
                    <span style={{ fontSize: 10, color: '#5C6068', fontWeight: 600 }}>
                      {locale === 'fr' ? 'Notes' : 'Notes'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#3D1F0F', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {g.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Right: stay history */}
            <div>
              <StayHistory guest={guest} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
