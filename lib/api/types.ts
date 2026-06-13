// lib/api/types.ts
// Raw API types — exactly matching the backend OpenAPI schema

export type ApiRoomType    = 'SINGLE' | 'DOUBLE' | 'SUITE'
export type ApiRoomStatus  = 'LIBRE' | 'OCCUPEE' | 'TRAVAUX' | 'NETTOYAGE'
export type ApiResStatus   = 'CONFIRMEE' | 'CHECKIN' | 'CHECKOUT' | 'NOSHOW'
export type ApiCurrency    = 'EUR' | 'FCFA' | 'USD'
export type ApiStayType    = 'NUIT' | 'PASSAGE'

// ─── Resources ────────────────────────────────────────────────────────────────

export interface ApiRoom {
  id: number
  number: string
  floor: number
  type: ApiRoomType
  status: ApiRoomStatus
  price: number | string
  currency: ApiCurrency
  guestId: string | null
  guest?: ApiGuest | null
}

export interface ApiGuest {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  roomId: number | null
  room?: ApiRoom | null
  totalStays?: number
  totalSpent?: number
  lastStay?: string | null
}

/** Detail response from GET /api/guests/{id} — includes paginated reservations */
export interface ApiGuestDetail extends ApiGuest {
  reservations?: Paginated<ApiReservation>
}

export interface ApiServiceItem {
  id: string
  name: string
  price: number | string
  currency: ApiCurrency
}

export interface ApiReservationService {
  serviceId: string
  quantity: number
  service?: ApiServiceItem
}

export interface ApiReservation {
  id: string
  guestId: string
  roomId: number
  checkIn: string
  checkOut: string
  stayType: ApiStayType
  durationHours: number | null
  status: ApiResStatus
  totalAmount: number | string
  currency: ApiCurrency
  services: ApiReservationService[]
  guest?: ApiGuest | null
  room?: ApiRoom | null
  createdAt?: string
}

export type ApiRoomStatusLower = 'libre' | 'occupee' | 'travaux' | 'nettoyage'

export interface ApiDashboardAlert {
  type: string
  message: string
  count: number
}

export interface ApiDashboardStats {
  occupancyRate:      number
  occupiedRooms:      number
  totalRooms:         number
  todayRevenue:       number | string
  weekRevenue:        number | string
  checkInsToday:      number
  checkOutsToday:     number
  roomsToClean:       number
  pendingReservations: number
  roomsByStatus:      Partial<Record<ApiRoomStatusLower, number>>
  alerts:             ApiDashboardAlert[]
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateRoomDto {
  number: string
  floor: number
  type: ApiRoomType
  status?: ApiRoomStatus
  price: number
  currency?: ApiCurrency
  guestId?: string
}
export type UpdateRoomDto = Partial<CreateRoomDto>
export interface UpdateRoomStatusDto { status: ApiRoomStatus }

export interface CreateGuestDto {
  firstName: string
  lastName: string
  phone: string
  email: string
  roomId?: number
}
export type UpdateGuestDto = Partial<CreateGuestDto>

export interface CreateReservationDto {
  guestId: string
  roomId: number
  checkIn: string
  checkOut?: string
  stayType?: ApiStayType
  durationHours?: number
  totalAmount?: number
  currency?: ApiCurrency
  services?: { serviceId: string; quantity?: number }[]
}
export type UpdateReservationDto = Partial<CreateReservationDto>
export interface UpdateReservationStatusDto { status: ApiResStatus }

export interface CreateServiceDto { name: string; price: number; currency?: ApiCurrency }
export type UpdateServiceDto = Partial<CreateServiceDto>

// ─── Query params ─────────────────────────────────────────────────────────────

export interface RoomListParams {
  page?: number; limit?: number
  sortBy?: 'floor' | 'number' | 'price' | 'status' | 'type'
  order?: 'asc' | 'desc'
  floor?: number; type?: ApiRoomType; status?: ApiRoomStatus
  q?: string; minPrice?: number; maxPrice?: number; guestId?: string
}

export interface GuestListParams {
  page?: number; limit?: number
  sortBy?: 'lastName' | 'firstName' | 'email' | 'createdAt'
  order?: 'asc' | 'desc'
  q?: string; hasRoom?: boolean; roomId?: number
  checkInFrom?: string; checkInTo?: string
}

export interface ReservationListParams {
  page?: number; limit?: number
  sortBy?: 'checkIn' | 'checkOut' | 'createdAt' | 'totalAmount' | 'status'
  order?: 'asc' | 'desc'
  q?: string; status?: ApiResStatus; roomId?: number; guestId?: string
  checkInFrom?: string; checkInTo?: string
  checkOutFrom?: string; checkOutTo?: string
  date?: 'today'; upcoming?: boolean; active?: boolean
  minAmount?: number; maxAmount?: number
}

export interface ServiceListParams {
  page?: number; limit?: number
  sortBy?: 'name' | 'price'; order?: 'asc' | 'desc'
  q?: string; minPrice?: number; maxPrice?: number
}

// ─── Dashboard — new endpoints ────────────────────────────────────────────────

export type ApiAlertType = 'checkin' | 'checkout' | 'nettoyage' | 'maintenance' | 'paiement' | 'vip'
export type ApiAlertPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ApiEventType = 'checkin' | 'checkout' | 'service' | 'paiement' | 'alerte' | 'note'

export interface ApiDashboardAlertItem {
  id: string
  type: ApiAlertType
  priority: ApiAlertPriority
  message: string
  messageEn: string
  resolved: boolean
  createdAt: string
  roomId: number | null
  guestId: string | null
  reservationId: string | null
}

export interface ApiDashboardEvent {
  id: string
  type: ApiEventType
  title: string
  titleEn: string
  description: string
  time: string
  amount: number | null
  guestId: string | null
  roomId: number | null
  reservationId: string | null
}

export interface ApiDailyRevenue {
  date: string
  rooms: number
  services: number
  total: number
}
