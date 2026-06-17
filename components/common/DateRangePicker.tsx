// components/common/DateRangePicker.tsx
'use client'

import { useState } from 'react'
import { NativeInput } from './ui'
import { Calendar, X } from 'lucide-react'

export interface DateRange {
  from: string
  to:   string
}

interface Props {
  value:    DateRange
  onChange: (range: DateRange) => void
  label?:   string
}

const today      = () => new Date().toISOString().slice(0, 10)
const daysAgo    = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }
const lastMonthRange = (): DateRange => {
  const now  = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to   = new Date(now.getFullYear(), now.getMonth(), 0)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

const SHORTCUTS = [
  { label: "Aujourd'hui",    getRange: (): DateRange => ({ from: today(), to: today() }) },
  { label: '7 derniers j.', getRange: (): DateRange => ({ from: daysAgo(6), to: today() }) },
  { label: 'Ce mois',       getRange: (): DateRange => ({ from: monthStart(), to: today() }) },
  { label: 'Mois dernier',  getRange: lastMonthRange },
]

export function DateRangePicker({ value, onChange, label }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const handleShortcut = (s: typeof SHORTCUTS[0]) => {
    const range = s.getRange()
    setActive(s.label)
    onChange(range)
  }

  const handleReset = () => {
    setActive(null)
    onChange({ from: '', to: '' })
  }

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#5C6068', letterSpacing: '0.04em', marginBottom: 8 }}>
          {label}
        </div>
      )}

      {/* Shortcuts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            onClick={() => handleShortcut(s)}
            type="button"
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${active === s.label ? '#B5924C' : '#EDE8DF'}`,
              background: active === s.label ? '#B5924C12' : '#FFFFFF',
              color: active === s.label ? '#B5924C' : '#5C6068',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <Calendar size={14} strokeWidth={1.25} style={{ color: '#B5924C', flexShrink: 0 }} />
          <NativeInput
            type="date"
            value={value.from}
            onChange={(e) => { setActive(null); onChange({ ...value, from: e.target.value }) }}
            style={{ fontSize: 12 }}
          />
        </div>
        <span style={{ color: '#5C6068', fontSize: 12 }}>→</span>
        <div style={{ flex: 1 }}>
          <NativeInput
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => { setActive(null); onChange({ ...value, to: e.target.value }) }}
            style={{ fontSize: 12 }}
          />
        </div>
        {(value.from || value.to) && (
          <button
            onClick={handleReset}
            type="button"
            title="Réinitialiser"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '1px solid #EDE8DF',
              background: '#FAF7F2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5C6068',
              flexShrink: 0,
            }}
          >
            <X size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
