export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = Pick<Product, 'name' | 'description' | 'price' | 'stock'>
export type UpdateProductInput = Partial<CreateProductInput>
