// lib/queries/dashboard.ts
import { useQuery } from '@tanstack/react-query'
import {
  getDashboardStats,
  getDashboardAlerts,
  getDashboardEvents,
  getDashboardRevenue,
} from '@/lib/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn:  getDashboardStats,
    refetchInterval: 60_000,
  })
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn:  getDashboardAlerts,
    refetchInterval: 60_000,
  })
}

export function useDashboardEvents(date?: string) {
  return useQuery({
    queryKey: ['dashboard', 'events', date],
    queryFn:  () => getDashboardEvents(date),
    refetchInterval: 60_000,
  })
}

export function useDashboardRevenue(days = 7) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', days],
    queryFn:  () => getDashboardRevenue(days),
    refetchInterval: 300_000,
  })
}
