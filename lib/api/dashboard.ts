// lib/api/dashboard.ts
import { apiFetch } from './client'
import type {
  ApiDashboardStats,
  ApiDashboardAlertItem,
  ApiDashboardEvent,
  ApiDailyRevenue,
} from './types'

export interface DashboardStats {
  occupancyRate:       number
  todayRevenue:        number
  weekRevenue:         number
  checkInsToday:       number
  checkOutsToday:      number
  libreCount:          number
  occupeeCount:        number
  nettoyageCount:      number
  travauxCount:        number
  roomsToClean:        number
  pendingReservations: number
}

export type { ApiDashboardAlertItem as DashboardAlert }
export type { ApiDashboardEvent as DashboardEvent }
export type { ApiDailyRevenue as DailyRevenue }

export async function getDashboardStats(): Promise<DashboardStats> {
  const raw = await apiFetch<ApiDashboardStats>('/dashboard/stats')
  return {
    occupancyRate:       raw.occupancyRate,
    todayRevenue:        Number(raw.todayRevenue),
    weekRevenue:         Number(raw.weekRevenue),
    checkInsToday:       raw.checkInsToday,
    checkOutsToday:      raw.checkOutsToday,
    libreCount:          raw.roomsByStatus?.libre     ?? 0,
    occupeeCount:        raw.roomsByStatus?.occupee   ?? 0,
    nettoyageCount:      raw.roomsByStatus?.nettoyage ?? 0,
    travauxCount:        raw.roomsByStatus?.travaux   ?? 0,
    roomsToClean:        raw.roomsToClean,
    pendingReservations: raw.pendingReservations,
  }
}

export async function getDashboardAlerts(): Promise<ApiDashboardAlertItem[]> {
  // Response shape: { data: ApiDashboardAlertItem[] } after apiFetch unwrapping
  const res = await apiFetch<{ data: ApiDashboardAlertItem[] }>('/dashboard/alerts')
  return res.data ?? []
}

export async function getDashboardEvents(date?: string): Promise<ApiDashboardEvent[]> {
  const qs = date ? `?date=${date}` : ''
  const res = await apiFetch<{ data: ApiDashboardEvent[] }>(`/dashboard/events${qs}`)
  return res.data ?? []
}

export async function getDashboardRevenue(days = 7): Promise<ApiDailyRevenue[]> {
  const res = await apiFetch<{ data: ApiDailyRevenue[] }>(`/dashboard/revenue?days=${days}`)
  return res.data ?? []
}
