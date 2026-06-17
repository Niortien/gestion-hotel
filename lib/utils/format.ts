// lib/utils/format.ts
import { format, differenceInDays, parseISO } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import type { Locale } from '@/lib/i18n/config'

export type Currency = 'EUR' | 'FCFA' | 'USD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR:  '€',
  FCFA: 'FCFA',
  USD:  '$',
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'FCFA', label: 'FCFA (Franc CFA)' },
  { value: 'EUR',  label: 'EUR (Euro €)' },
  { value: 'USD',  label: 'USD (Dollar $)' },
]

/** Format an amount with its currency symbol. e.g. "25 000 FCFA", "120 €", "99 $" */
export function formatAmount(amount: number, currency: Currency = 'FCFA'): string {
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  if (currency === 'USD') return `${symbol}${formatted}`
  return `${formatted} ${symbol}`
}

export function formatDate(date: string | Date, locale: Locale = 'fr'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const dateLocale = locale === 'fr' ? fr : enUS
  const pattern = locale === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy'
  return format(d, pattern, { locale: dateLocale })
}

export function formatDateShort(date: string | Date, locale: Locale = 'fr'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const dateLocale = locale === 'fr' ? fr : enUS
  return format(d, 'dd/MM/yyyy', { locale: dateLocale })
}

export function formatTime(date: string | Date, locale: Locale = 'fr'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: locale === 'fr' ? fr : enUS })
}

export function formatDateTime(date: string | Date, locale: Locale = 'fr'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const dateLocale = locale === 'fr' ? fr : enUS
  const pattern = locale === 'fr' ? "d MMM yyyy 'à' HH:mm" : "MMM d, yyyy 'at' HH:mm"
  return format(d, pattern, { locale: dateLocale })
}

export function formatPrice(amount: number, currency = 'FCFA', _locale = 'fr-FR'): string {
  return formatAmount(amount, (currency as Currency) in CURRENCY_SYMBOLS ? currency as Currency : 'FCFA')
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k FCFA`
  return `${amount} FCFA`
}

export function getNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatInvoiceNumber(id: string): string {
  const num = id.replace(/\D/g, '').padStart(4, '0')
  return `FAC-2026-${num}`
}
