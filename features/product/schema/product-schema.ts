import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().min(1, 'La description est requise'),
  price: z.number({ error: 'Le prix est requis' }).positive('Le prix doit être positif'),
  stock: z.number({ error: 'Le stock est requis' }).int().min(0, 'Le stock ne peut pas être négatif'),
})

export const updateProductSchema = productSchema.partial()

export type ProductFormData = z.infer<typeof productSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
