import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '../schema/product-schema'

export function useProductForm(defaultValues?: Partial<ProductFormData>) {
  return useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      ...defaultValues,
    },
  })
}
