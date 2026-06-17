// lib/api/rapports-financiers.ts
import { apiFetch } from './client'
import type { ApiRevenueRange, ApiRapportMensuel, ApiResumePeriode } from './types'

export async function getRevenueRange(from: string, to: string): Promise<ApiRevenueRange> {
  return apiFetch(`/dashboard/revenue-range?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
}

export async function getRapportMensuel(mois: string): Promise<ApiRapportMensuel> {
  return apiFetch(`/dashboard/rapport-mensuel?mois=${encodeURIComponent(mois)}`)
}

export async function getResumePeriode(from: string, to: string): Promise<ApiResumePeriode> {
  return apiFetch(`/dashboard/resume?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
}
