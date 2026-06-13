// components/parametres/UserSettingsForm.tsx
'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NativeInput, NativeSelect } from '@/components/common/ui'
import { useHotelStore } from '@/store/hotel-store'
import { HOTEL_USERS } from '@/lib/data/hotel'
import type { HotelUser, UserRole } from '@/types/hotel'
import { getInitials } from '@/lib/utils/format'
import { Save, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(2),
  lastName:  z.string().min(2),
  email:     z.string().email(),
  role:      z.string().min(1),
})

type FormData = z.infer<typeof schema>

const ROLES: UserRole[] = ['admin', 'receptionist', 'housekeeper', 'manager']

export function UserSettingsForm() {
  const locale = useHotelStore((s) => s.locale)
  const [users, setUsers] = useState<HotelUser[]>(HOTEL_USERS)
  const [editId, setEditId] = useState<string | null>(null)

  const user = users.find((u) => u.id === editId)

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } : { firstName: '', lastName: '', email: '', role: 'receptionist' },
  })

  const onSelect = (u: HotelUser) => {
    setEditId(u.id)
    reset({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role })
  }

  const onSubmit = (data: FormData) => {
    setUsers((prev) => prev.map((u) => u.id === editId ? { ...u, firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role as UserRole } : u))
    toast.success(locale === 'fr' ? 'Utilisateur mis à jour' : 'User updated')
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: '#8B1A2F',
    receptionniste: '#1A6B4A',
    gouvernante: '#607856',
    maintenance: '#C9A84C',
    comptable: '#B5924C',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {locale === 'fr' ? 'Utilisateurs' : 'Users'}
        </div>
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 10,
              border: `1px solid ${editId === u.id ? '#B5924C' : '#EDE8DF'}`,
              background: editId === u.id ? '#B5924C12' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `${ROLE_COLORS[u.role] ?? '#5C6068'}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: ROLE_COLORS[u.role] ?? '#5C6068',
                flexShrink: 0,
              }}
            >
              {getInitials(u.firstName, u.lastName)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3D1F0F' }}>{u.firstName} {u.lastName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={9} strokeWidth={1.25} style={{ color: ROLE_COLORS[u.role] }} />
                <span style={{ fontSize: 10, color: ROLE_COLORS[u.role] ?? '#5C6068' }}>{u.role}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Edit form */}
      <div>
        {!editId ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5C6068', fontSize: 13 }}>
            {locale === 'fr' ? 'Sélectionnez un utilisateur' : 'Select a user'}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Controller name="firstName" control={control} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Prénom' : 'First name'} />
              )} />
              <Controller name="lastName" control={control} render={({ field }) => (
                <NativeInput {...field} label={locale === 'fr' ? 'Nom' : 'Last name'} />
              )} />
            </div>
            <Controller name="email" control={control} render={({ field }) => (
              <NativeInput {...field} type="email" label="Email" />
            )} />
            <Controller name="role" control={control} render={({ field }) => (
              <NativeSelect
                label={locale === 'fr' ? 'Rôle' : 'Role'}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </NativeSelect>
            )} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={!isDirty} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', background: isDirty ? 'linear-gradient(135deg, #B5924C, #D4AF72)' : '#EDE8DF', color: isDirty ? '#FAF7F2' : '#5C6068', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: isDirty ? 'pointer' : 'not-allowed' }}>
                <Save size={13} strokeWidth={1.5} />
                {locale === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
