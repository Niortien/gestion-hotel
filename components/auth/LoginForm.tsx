'use client'
// components/auth/LoginForm.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const { setTokens, isAuthenticated, _hasHydrated } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, _hasHydrated, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      const res = await login(data.email, data.password)
      setTokens(res.access_token, res.refresh_token)
      router.replace('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FAF7F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}>
        {/* Logo / title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 28,
            fontFamily: 'var(--font-cormorant)',
            color: '#3D1F0F',
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 6,
          }}>
            Grand Hôtel
          </div>
          <div style={{ fontSize: 13, color: '#5C6068', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Système de gestion
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit(onSubmit)} style={{
          background: '#fff',
          border: '1px solid #EDE8DF',
          borderRadius: 16,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 4px 24px rgba(61,31,15,0.06)',
        }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#5C6068', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="reception@hotel.fr"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #EDE8DF',
                fontSize: 14,
                color: '#3D1F0F',
                background: '#FAF7F2',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#5C6068', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  padding: '10px 40px 10px 14px',
                  borderRadius: 10,
                  border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #EDE8DF',
                  fontSize: 14,
                  color: '#3D1F0F',
                  background: '#FAF7F2',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#5C6068', padding: 0,
                }}
              >
                {showPwd ? <EyeOff size={16} strokeWidth={1.25} /> : <Eye size={16} strokeWidth={1.25} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.password.message}</span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 13,
              color: '#dc2626',
            }}>
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 0',
              borderRadius: 10,
              background: isSubmitting ? '#D4AF72' : '#B5924C',
              color: '#FAF7F2',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
