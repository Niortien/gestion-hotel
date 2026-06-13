// components/common/ui.tsx
// Lightweight native form components matching the Grand Hôtel design system
'use client'

import { type ReactNode, forwardRef, useState, useEffect, useRef } from 'react'
import { gsap } from '@/lib/animations/gsap.config'
import { X } from 'lucide-react'

// ─── FieldWrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#5C6068', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: '#8B1A2F' }}>{error}</span>
      )}
    </div>
  )
}

// ─── NativeInput ─────────────────────────────────────────────────────────────

interface NativeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(
  ({ label, error, style, ...props }, ref) => {
    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: '9px 12px',
      background: '#FFFFFF',
      border: `1px solid ${error ? '#8B1A2F' : '#EDE8DF'}`,
      borderRadius: 10,
      fontSize: 13,
      color: '#3D1F0F',
      outline: 'none',
      transition: 'border-color 0.15s',
      boxSizing: 'border-box',
      ...style,
    }
    const el = (
      <input
        ref={ref}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#B5924C' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#8B1A2F' : '#EDE8DF' }}
        {...props}
      />
    )
    if (!label) return el
    return <Field label={label} error={error}>{el}</Field>
  }
)
NativeInput.displayName = 'NativeInput'

// ─── NativeSelect ─────────────────────────────────────────────────────────────

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ label, error, style, children, ...props }, ref) => {
    const selectStyle: React.CSSProperties = {
      width: '100%',
      padding: '9px 12px',
      background: '#FFFFFF',
      border: `1px solid ${error ? '#8B1A2F' : '#EDE8DF'}`,
      borderRadius: 10,
      fontSize: 13,
      color: '#3D1F0F',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C6068' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      paddingRight: 32,
      ...style,
    }
    const el = (
      <select
        ref={ref}
        style={selectStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#B5924C' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#8B1A2F' : '#EDE8DF' }}
        {...props}
      >
        {children}
      </select>
    )
    if (!label) return el
    return <Field label={label} error={error}>{el}</Field>
  }
)
NativeSelect.displayName = 'NativeSelect'

// ─── SimpleModal ─────────────────────────────────────────────────────────────

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: number
}

export function SimpleModal({ isOpen, onClose, title, children, width = 520 }: SimpleModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return
    if (isOpen) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      gsap.fromTo(panelRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
    }
  }, [isOpen])

  const handleClose = () => {
    if (!overlayRef.current || !panelRef.current) { onClose(); return }
    gsap.to(panelRef.current, { y: 12, opacity: 0, duration: 0.2 })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose })
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61,31,15,0.35)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        ref={panelRef}
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #EDE8DF',
          boxShadow: '0 24px 64px rgba(61,31,15,0.18)',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #EDE8DF',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: 22,
                fontWeight: 400,
                color: '#3D1F0F',
              }}
            >
              {title}
            </span>
            <button
              onClick={handleClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '1px solid #EDE8DF',
                background: '#FAF7F2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5C6068',
              }}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: number
}

export function Drawer({ isOpen, onClose, title, children, width = 480 }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return
    if (isOpen) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      gsap.fromTo(panelRef.current, { x: width }, { x: 0, duration: 0.3, ease: 'power3.out' })
    }
  }, [isOpen, width])

  const handleClose = () => {
    if (!overlayRef.current || !panelRef.current) { onClose(); return }
    gsap.to(panelRef.current,  { x: width, duration: 0.25, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose })
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61,31,15,0.3)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
      }}
    >
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: width,
          background: '#FFFFFF',
          borderLeft: '1px solid #EDE8DF',
          boxShadow: '-12px 0 48px rgba(61,31,15,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #EDE8DF',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 24,
              fontWeight: 400,
              color: '#3D1F0F',
            }}
          >
            {title}
          </span>
          <button
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid #EDE8DF',
              background: '#FAF7F2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5C6068',
            }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
