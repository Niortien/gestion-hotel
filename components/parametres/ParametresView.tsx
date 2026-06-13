// components/parametres/ParametresView.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { initGSAP } from '@/lib/animations/gsap.config'
import { animatePageIn } from '@/lib/animations/pageTransitions'
import { useHotelStore } from '@/store/hotel-store'
import { useRooms } from '@/lib/queries/rooms'
import { RoomSettingsForm } from './RoomSettingsForm'
import { PricingForm } from './PricingForm'
import { UserSettingsForm } from './UserSettingsForm'
import { ServicesForm } from './ServicesForm'
import { NativeSelect } from '@/components/common/ui'
import { BedDouble, Percent, Users, Globe, ConciergeBell } from 'lucide-react'

type Tab = 'rooms' | 'pricing' | 'users' | 'general' | 'services'

export function ParametresView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const locale = useHotelStore((s) => s.locale)
  const setLocale = useHotelStore((s) => s.setLocale)
  const { data: rooms = [] } = useRooms()
  const [activeTab, setActiveTab] = useState<Tab>('rooms')
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id ?? '')

  useEffect(() => {
    initGSAP()
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const tabs: { id: Tab; label: string; icon: typeof BedDouble }[] = [
    { id: 'rooms',    label: locale === 'fr' ? 'Chambres'   : 'Rooms',    icon: BedDouble },
    { id: 'pricing',  label: locale === 'fr' ? 'Tarifs'     : 'Pricing',  icon: Percent },
    { id: 'services', label: locale === 'fr' ? 'Services'   : 'Services', icon: ConciergeBell },
    { id: 'users',    label: locale === 'fr' ? 'Utilisateurs' : 'Users',  icon: Users },
    { id: 'general',  label: locale === 'fr' ? 'Général'    : 'General',  icon: Globe },
  ]

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  return (
    <div ref={pageRef} style={{ maxWidth: 980, margin: '0 auto' }}>
      {/* Header */}
      <div data-animate style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 42, fontWeight: 300, color: '#3D1F0F', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {locale === 'fr' ? 'Paramètres' : 'Settings'}
        </h1>
        <p style={{ color: '#5C6068', fontSize: 14, marginTop: 4 }}>
          {locale === 'fr' ? 'Configuration du système hôtelier' : 'Hotel system configuration'}
        </p>
        <div className="brass-line" style={{ marginTop: 16 }} />
      </div>

      {/* Tabs */}
      <div
        data-animate
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid #EDE8DF',
          marginBottom: 28,
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === id ? '#B5924C' : '#5C6068',
              fontSize: 13,
              fontWeight: activeTab === id ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              borderBottom: activeTab === id ? '2px solid #B5924C' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} strokeWidth={1.25} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        data-animate
        style={{
          background: '#FFFFFF',
          border: '1px solid #EDE8DF',
          borderRadius: 16,
          padding: '24px 28px',
        }}
      >
        {activeTab === 'rooms' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <NativeSelect
                label={locale === 'fr' ? 'Sélectionner une chambre' : 'Select a room'}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                style={{ maxWidth: 360 }}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.number} — {r.type} (Étage {r.floor})</option>
                ))}
              </NativeSelect>
            </div>
            {selectedRoom && <RoomSettingsForm room={selectedRoom} key={selectedRoom.id} />}
          </div>
        )}

        {activeTab === 'pricing' && <PricingForm />}

        {activeTab === 'services' && <ServicesForm />}

        {activeTab === 'users' && <UserSettingsForm />}

        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontWeight: 500, color: '#3D1F0F', marginBottom: 4 }}>
              {locale === 'fr' ? 'Langue de l\'interface' : 'Interface language'}
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {([['fr', 'Français'], ['en', 'English']] as const).map(([lang, label]) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    border: `1px solid ${locale === lang ? '#B5924C' : '#EDE8DF'}`,
                    background: locale === lang ? '#B5924C18' : '#FFFFFF',
                    color: locale === lang ? '#B5924C' : '#5C6068',
                    fontSize: 13,
                    fontWeight: locale === lang ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#5C6068', marginBottom: 8 }}>
                {locale === 'fr' ? 'Informations de l\'établissement' : 'Establishment info'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600 }}>
                {[
                  ['Grand Hôtel Contemporain', locale === 'fr' ? 'Nom de l\'hôtel' : 'Hotel name'],
                  ['1 Avenue de la Paix, 75001 Paris', locale === 'fr' ? 'Adresse' : 'Address'],
                  ['+33 1 42 00 00 00', locale === 'fr' ? 'Téléphone' : 'Phone'],
                  ['contact@grandhotel.fr', 'Email'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: '#5C6068', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, color: '#3D1F0F', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
