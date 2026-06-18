'use client'

import { useState, useRef } from 'react'
import {
  DateRangePicker,
  DateRangePickerStateContext,
  Group,
  DateInput,
  DateSegment,
  Popover,
  Dialog,
  RangeCalendar,
  CalendarGrid,
  CalendarCell,
  CalendarHeading,
  Button,
  Label,
} from 'react-aria-components'
import {
  getLocalTimeZone,
  today,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  CalendarDate,
} from '@internationalized/date'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

export interface HotelDateRange {
  from: string
  to: string
}

interface Props {
  value?: HotelDateRange
  onChange: (range: HotelDateRange) => void
  label?: string
}

const tz = getLocalTimeZone()

function toCalDate(iso: string): CalendarDate {
  const [y, m, d] = iso.split('-').map(Number)
  return new CalendarDate(y, m, d)
}

function fromCalDate(d: CalendarDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

const PRESETS = [
  { label: "Aujourd'hui",     getRange: () => { const t = today(tz); return { start: t, end: t } } },
  { label: 'Hier',            getRange: () => { const t = today(tz).subtract({ days: 1 }); return { start: t, end: t } } },
  { label: 'Cette semaine',   getRange: () => { const t = today(tz); return { start: startOfWeek(t, 'fr-FR'), end: endOfWeek(t, 'fr-FR') } } },
  { label: 'Semaine dernière',getRange: () => { const t = today(tz).subtract({ weeks: 1 }); return { start: startOfWeek(t, 'fr-FR'), end: endOfWeek(t, 'fr-FR') } } },
  { label: 'Ce mois',        getRange: () => { const t = today(tz); return { start: startOfMonth(t), end: endOfMonth(t) } } },
  { label: 'Mois dernier',   getRange: () => { const t = today(tz).subtract({ months: 1 }); return { start: startOfMonth(t), end: endOfMonth(t) } } },
  { label: 'Cette année',    getRange: () => { const t = today(tz); return { start: startOfYear(t), end: endOfYear(t) } } },
  { label: 'Depuis toujours', getRange: () => { const t = today(tz); return { start: new CalendarDate(2020, 1, 1), end: t } } },
]

export function HotelDateRangePicker({ value, onChange, label }: Props) {
  const defaultValue = value?.from && value?.to
    ? { start: toCalDate(value.from), end: toCalDate(value.to) }
    : null

  const [pending, setPending] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const apply = (range: { start: CalendarDate; end: CalendarDate } | null) => {
    if (!range) return
    onChange({ from: fromCalDate(range.start), to: fromCalDate(range.end) })
    setIsOpen(false)
  }

  const displayText = value?.from && value?.to
    ? `${new Date(value.from + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} → ${new Date(value.to + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Sélectionner une période'

  return (
    <div style={{ position: 'relative', display: 'inline-block', minWidth: 280 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C6068', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {label}
        </div>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFFFFF', border: '1.5px solid #EDE8DF', borderRadius: 12,
          padding: '10px 14px', cursor: 'pointer', width: '100%',
          fontFamily: 'inherit', fontSize: 13, color: value?.from ? '#3D1F0F' : '#9CA3AF',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B5924C' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE8DF' }}
      >
        <CalendarDays size={16} strokeWidth={1.5} style={{ color: '#B5924C', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{displayText}</span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setIsOpen(false)}
          />

          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 100,
            marginTop: 8, background: '#FFFFFF', border: '1px solid #EDE8DF',
            borderRadius: 20, boxShadow: '0 20px 60px rgba(61,31,15,0.15)',
            display: 'flex', overflow: 'hidden', minWidth: 660,
          }}>
            {/* Presets sidebar */}
            <div style={{
              width: 160, borderRight: '1px solid #EDE8DF', padding: '16px 0',
              background: '#FAF7F2', flexShrink: 0,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B5924C', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 16px 10px' }}>
                Raccourcis
              </div>
              {PRESETS.map(({ label: pLabel, getRange }) => {
                const r = getRange()
                const isSelected = pending
                  ? fromCalDate(r.start) === fromCalDate(pending.start) && fromCalDate(r.end) === fromCalDate(pending.end)
                  : false
                return (
                  <button
                    key={pLabel}
                    onClick={() => { setPending(getRange()) }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 16px',
                      background: isSelected ? '#B5924C18' : 'transparent',
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      color: isSelected ? '#B5924C' : '#3D1F0F',
                      fontWeight: isSelected ? 600 : 400,
                      borderLeft: isSelected ? '3px solid #B5924C' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#FAF7F2' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {pLabel}
                  </button>
                )
              })}
            </div>

            {/* Calendar + actions */}
            <div style={{ padding: 20, flex: 1 }}>
              <DateRangePicker
                value={pending}
                onChange={(range) => setPending(range)}
                granularity="day"
              >
                <RangeCalendar style={{ width: '100%' }}>
                  {/* Navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Button
                      slot="previous"
                      style={{
                        width: 30, height: 30, borderRadius: 8, border: '1px solid #EDE8DF',
                        background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#5C6068',
                      }}
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <CalendarHeading style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, fontWeight: 500, color: '#3D1F0F' }} />
                    <Button
                      slot="next"
                      style={{
                        width: 30, height: 30, borderRadius: 8, border: '1px solid #EDE8DF',
                        background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#5C6068',
                      }}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>

                  <CalendarGrid>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        style={({ isSelected, isInvalid, isDisabled, isSelectionStart, isSelectionEnd }) => ({
                          width: 34, height: 34,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: isSelectionStart || isSelectionEnd ? 8 : 0,
                          fontSize: 12,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          color: isDisabled ? '#D1D5DB' : isSelected ? '#FFFFFF' : '#3D1F0F',
                          background: isSelectionStart || isSelectionEnd
                            ? '#B5924C'
                            : isSelected
                              ? '#B5924C30'
                              : 'transparent',
                          fontWeight: isSelectionStart || isSelectionEnd ? 700 : 400,
                          transition: 'background 0.1s',
                        })}
                      />
                    )}
                  </CalendarGrid>
                </RangeCalendar>
              </DateRangePicker>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setPending(null); setIsOpen(false) }}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px solid #EDE8DF',
                    background: '#FFFFFF', fontSize: 12, cursor: 'pointer', color: '#5C6068',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => apply(pending)}
                  disabled={!pending}
                  style={{
                    padding: '8px 20px', borderRadius: 8, border: 'none',
                    background: pending ? '#B5924C' : '#EDE8DF',
                    color: pending ? '#FFFFFF' : '#9CA3AF',
                    fontSize: 12, fontWeight: 600, cursor: pending ? 'pointer' : 'not-allowed',
                  }}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
