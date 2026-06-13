// lib/queries/services.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/services'
import type { ServiceListParams, CreateServiceDto, UpdateServiceDto } from '@/lib/api/types'

const KEY = 'services'

export function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => api.getServices(params),
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateServiceDto) => api.createService(dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & UpdateServiceDto) =>
      api.updateService(id, dto),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
