import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getProducts, getProductById } from '../api/product-api'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: number) => ['products', id] as const,
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: getProducts,
    throwOnError: (error) => {
      toast.error(error.message ?? 'Erreur lors du chargement des produits')
      return false
    },
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
    throwOnError: (error) => {
      toast.error(error.message ?? 'Erreur lors du chargement du produit')
      return false
    },
  })
}
