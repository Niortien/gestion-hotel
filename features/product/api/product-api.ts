// API calls pour les produits
import type { Product, CreateProductInput, UpdateProductInput } from '../types'
import { apiConfig } from '@/config/app.config'

const BASE_URL = `${apiConfig.baseUrl}/products`

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function getProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(id: number, data: UpdateProductInput): Promise<Product> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}
