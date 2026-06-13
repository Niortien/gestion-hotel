// lib/api/reports.ts
// Reports are GET endpoints that return JSON (used by frontend PDF renderer)
// The API generates data; we keep PDF rendering client-side with @react-pdf/renderer.
// These helpers fetch the report metadata from the API.

import { apiFetch, API_BASE } from './client'
import { useAuthStore } from '@/store/auth-store'

export interface ReportData {
  reservation: {
    id: string
    checkIn: string
    checkOut: string
    totalAmount: number
    status: string
  }
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  room: {
    id: number
    number: string
    type: string
    floor: number
    price: number
  }
  services?: { name: string; quantity: number; price: number }[]
}

export async function getReceiptData(reservationId: string): Promise<ReportData> {
  return apiFetch<ReportData>(`/reports/receipt/${reservationId}`)
}

export async function getInvoiceData(reservationId: string): Promise<ReportData> {
  return apiFetch<ReportData>(`/reports/invoice/${reservationId}`)
}

export async function getStayReportData(reservationId: string): Promise<ReportData> {
  return apiFetch<ReportData>(`/reports/stay/${reservationId}`)
}

/** Returns an authenticated URL for direct PDF download (for <a href> usage) */
export function getReportDownloadUrl(
  type: 'receipt' | 'invoice' | 'stay',
  reservationId: string,
): string {
  return `${API_BASE}/reports/${type}/${reservationId}`
}
