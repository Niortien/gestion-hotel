// lib/api/adapters.ts
// Maps raw API types ↔ local UI types

import type {
  ApiRoom, ApiGuest, ApiGuestDetail, ApiReservation, ApiRoomType, ApiRoomStatus, ApiResStatus,
  ApiServiceItem,
} from './types'
import type {
  Room, Guest, Reservation, RoomType, RoomStatus, ReservationStatus,
} from '@/types/hotel'

// ─── Room ─────────────────────────────────────────────────────────────────────

const ROOM_TYPE_MAP: Record<ApiRoomType, RoomType> = {
  SINGLE: 'standard',
  DOUBLE: 'deluxe',
  SUITE:  'suite',
}

const ROOM_TYPE_REVERSE: Record<RoomType, ApiRoomType> = {
  standard: 'SINGLE',
  deluxe:   'DOUBLE',
  suite:    'SUITE',
  prestige: 'SUITE',
}

const ROOM_STATUS_MAP: Record<ApiRoomStatus, RoomStatus> = {
  LIBRE:     'libre',
  OCCUPEE:   'occupee',
  NETTOYAGE: 'nettoyage',
  TRAVAUX:   'travaux',
}

const ROOM_STATUS_REVERSE: Record<RoomStatus, ApiRoomStatus> = {
  libre:     'LIBRE',
  occupee:   'OCCUPEE',
  nettoyage: 'NETTOYAGE',
  travaux:   'TRAVAUX',
}

const RES_STATUS_MAP: Record<ApiResStatus, ReservationStatus> = {
  CONFIRMEE: 'confirmee',
  CHECKIN:   'checkin',
  CHECKOUT:  'terminee',
  NOSHOW:    'no_show',
}

const RES_STATUS_REVERSE: Record<ReservationStatus, ApiResStatus> = {
  confirmee:  'CONFIRMEE',
  checkin:    'CHECKIN',
  en_attente: 'CONFIRMEE',
  terminee:   'CHECKOUT',
  annulee:    'CHECKOUT',
  no_show:    'NOSHOW',
}

export function adaptRoom(r: ApiRoom): Room {
  return {
    id:            String(r.id),
    number:        r.number,
    floor:         r.floor,
    type:          ROOM_TYPE_MAP[r.type] ?? 'standard',
    status:        ROOM_STATUS_MAP[r.status] ?? 'libre',
    basePrice:     Number(r.price),
    currency:      r.currency ?? 'FCFA',
    capacity:      2,
    surface:       0,
    view:          'rue',
    description:   '',
    descriptionEn: '',
    amenities:     [],
    images:        [],
  }
}

export function toApiRoomType(t: RoomType): ApiRoomType { return ROOM_TYPE_REVERSE[t] }
export function toApiRoomStatus(s: RoomStatus): ApiRoomStatus { return ROOM_STATUS_REVERSE[s] }
export function toApiResStatus(s: ReservationStatus): ApiResStatus { return RES_STATUS_REVERSE[s] ?? 'CONFIRMEE' }

// ─── Guest ────────────────────────────────────────────────────────────────────

export function adaptGuest(g: ApiGuest): Guest {
  return {
    id:          g.id,
    firstName:   g.firstName,
    lastName:    g.lastName,
    email:       g.email,
    phone:       g.phone,
    nationality: '',
    idNumber:    '',
    address:     '',
    city:        '',
    country:     '',
    createdAt:   new Date().toISOString().slice(0, 10),
    vip:         false,
    notes:       '',
    totalStays:  g.totalStays ?? 0,
    totalSpent:  g.totalSpent ?? 0,
    lastStay:    g.lastStay ?? undefined,
  }
}

/** Adapts the detail response from GET /api/guests/{id}, including inline reservations */
export function adaptGuestDetail(g: ApiGuestDetail): Guest {
  const base = adaptGuest(g)
  if (!g.reservations) return base
  return {
    ...base,
    reservations: g.reservations.data.map(adaptReservation),
    reservationsMeta: {
      total:      g.reservations.total,
      page:       g.reservations.page,
      limit:      g.reservations.limit,
      totalPages: g.reservations.totalPages,
    },
  }
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export function adaptReservation(r: ApiReservation): Reservation {
  return {
    id:          r.id,
    guestId:     r.guestId,
    roomId:      String(r.roomId),
    guest:       r.guest  ? adaptGuest(r.guest)   : undefined,
    room:        r.room   ? adaptRoom(r.room)      : undefined,
    checkIn:     r.checkIn,
    checkOut:    r.checkOut,
    status:      RES_STATUS_MAP[r.status] ?? 'en_attente',
    services:    (r.services ?? []).flatMap((s) => {
      if (!s.service) return []
      return [{
        service: {
          id:        s.service.id,
          name:      s.service.name,
          nameEn:    s.service.name,
          category:  'divers' as const,
          unitPrice: Number(s.service.price),
          currency:  s.service.currency ?? 'FCFA',
          unit:      'fois',
          icon:      '✦',
        },
        quantity: s.quantity,
        date:     r.checkIn,
      }]
    }),
    adults:      1,
    children:    0,
    totalAmount: Number(r.totalAmount),
    currency:    r.currency ?? 'FCFA',
    paidAmount:  0,
    notes:       '',
    createdAt:   r.createdAt ?? new Date().toISOString().slice(0, 10),
    source:      'direct',
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

import type { Service } from '@/types/hotel'

export function adaptService(s: ApiServiceItem): Service {
  return {
    id:        s.id,
    name:      s.name,
    nameEn:    s.name,
    category:  'divers',
    unitPrice: Number(s.price),
    currency:  s.currency ?? 'FCFA',
    unit:      'fois',
    icon:      '✦',
  }
}
