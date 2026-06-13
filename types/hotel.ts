// types/hotel.ts

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'prestige'
export type RoomStatus = 'libre' | 'occupee' | 'nettoyage' | 'travaux'
export type Currency = 'EUR' | 'FCFA' | 'USD'
export type ReservationStatus = 'confirmee' | 'checkin' | 'en_attente' | 'annulee' | 'terminee' | 'no_show'
export type ServiceCategory = 'restauration' | 'spa' | 'transport' | 'divers'
export type AlertType = 'checkin' | 'checkout' | 'nettoyage' | 'maintenance' | 'paiement' | 'vip'
export type EventType = 'checkin' | 'checkout' | 'service' | 'paiement' | 'alerte' | 'note'
export type UserRole = 'admin' | 'receptionist' | 'housekeeper' | 'manager'
export type BookingSource = 'direct' | 'booking' | 'expedia' | 'airbnb' | 'telephone'
export type RoomView = 'jardin' | 'rue' | 'cour' | 'panoramique'

export interface Service {
  id: string
  name: string
  nameEn: string
  category: ServiceCategory
  unitPrice: number
  currency: Currency
  unit: string
  icon: string
}

export interface ServiceItem {
  service: Service
  quantity: number
  date: string
  notes?: string
}

export interface Room {
  id: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  capacity: number
  basePrice: number
  currency: Currency
  amenities: string[]
  description: string
  descriptionEn: string
  currentGuestId?: string
  currentReservationId?: string
  lastCleaned?: string
  surface: number
  view: RoomView
  images?: string[]
}

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  idNumber: string
  address: string
  city: string
  country: string
  createdAt: string
  vip: boolean
  notes: string
  totalStays: number
  totalSpent: number
  lastStay?: string
  preferredRoomType?: RoomType
  language?: 'fr' | 'en'
  /** Inline reservations returned by GET /api/guests/{id} */
  reservations?: Reservation[]
  reservationsMeta?: { total: number; page: number; limit: number; totalPages: number }
}

export interface Reservation {
  id: string
  guestId: string
  roomId: string
  /** Embedded guest from GET /api/reservations/{id} */
  guest?: Guest
  /** Embedded room from GET /api/reservations/{id} */
  room?: Room
  checkIn: string
  checkOut: string
  status: ReservationStatus
  services: ServiceItem[]
  adults: number
  children: number
  totalAmount: number
  currency: Currency
  paidAmount: number
  notes: string
  createdAt: string
  confirmedAt?: string
  cancelledAt?: string
  source: BookingSource
  invoiceNumber?: string
}

export interface HotelUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
  department: string
}

export interface Alert {
  id: string
  type: AlertType
  message: string
  messageEn: string
  roomId?: string
  guestId?: string
  reservationId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  resolved: boolean
}

export interface DailyRevenue {
  date: string
  rooms: number
  services: number
  total: number
}

export interface TimelineEvent {
  id: string
  type: EventType
  title: string
  titleEn: string
  description: string
  time: string
  guestId?: string
  roomId?: string
  reservationId?: string
  amount?: number
}

export interface HotelStats {
  occupancyRate: number
  totalRooms: number
  occupiedRooms: number
  freeRooms: number
  cleaningRooms: number
  maintenanceRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  todayRevenue: number
  monthRevenue: number
  pendingAlerts: number
}

export interface PricingRule {
  id: string
  roomType: RoomType
  season: 'haute' | 'basse' | 'normale'
  startDate: string
  endDate: string
  pricePerNight: number
  minNights?: number
}
