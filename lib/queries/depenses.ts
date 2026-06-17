// lib/queries/depenses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDepenses,
  createDepense,
  updateDepense,
  deleteDepense,
} from '@/lib/api/depenses'
import type { DepenseListParams, CreateDepenseDto, UpdateDepenseDto } from '@/lib/api/types'

export function useDepenses(params: DepenseListParams = {}) {
  return useQuery({
    queryKey: ['depenses', params],
    queryFn:  () => getDepenses(params),
  })
}

export function useCreateDepense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDepenseDto) => createDepense(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depenses'] }),
  })
}

export function useUpdateDepense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepenseDto }) => updateDepense(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depenses'] }),
  })
}

export function useDeleteDepense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDepense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depenses'] }),
  })
}
