// lib/queries/rapports-financiers.ts
import { useQuery } from '@tanstack/react-query'
import { getRevenueRange, getRapportMensuel, getResumePeriode } from '@/lib/api/rapports-financiers'

export function useRevenueRange(from: string, to: string) {
  return useQuery({
    queryKey: ['revenue-range', from, to],
    queryFn:  () => getRevenueRange(from, to),
    enabled:  Boolean(from && to),
  })
}

export function useRapportMensuel(mois: string) {
  return useQuery({
    queryKey: ['rapport-mensuel', mois],
    queryFn:  () => getRapportMensuel(mois),
    enabled:  Boolean(mois),
  })
}

export function useResumePeriode(from: string, to: string) {
  return useQuery({
    queryKey: ['resume-periode', from, to],
    queryFn:  () => getResumePeriode(from, to),
    enabled:  Boolean(from && to),
    refetchInterval: 60_000,
  })
}
