import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createProduct, updateProduct, deleteProduct } from '../api/product-api'
import { productKeys } from '../query/product-queries'
import type { CreateProductInput, UpdateProductInput } from '../types'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit créé avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la création du produit')
    },
  })
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductInput) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      toast.success('Produit mis à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du produit')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du produit')
    },
  })
}
