// lib/data/hotel.ts
import type {
  Room,
  Guest,
  Reservation,
  Service,
  Alert,
  HotelUser,
  TimelineEvent,
  DailyRevenue,
  HotelStats,
  PricingRule,
} from '@/types/hotel'

// ─── Services ────────────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  { id: 's1', name: 'Petit-déjeuner', nameEn: 'Breakfast', category: 'restauration', unitPrice: 24, currency: 'FCFA', unit: 'personne', icon: 'coffee' },
  { id: 's2', name: 'Dîner gastronomique', nameEn: 'Gourmet dinner', category: 'restauration', unitPrice: 85, currency: 'FCFA', unit: 'personne', icon: 'utensils' },
  { id: 's3', name: 'Room service', nameEn: 'Room service', category: 'restauration', unitPrice: 35, currency: 'FCFA', unit: 'commande', icon: 'concierge-bell' },
  { id: 's4', name: 'Soin spa 60 min', nameEn: 'Spa treatment 60 min', category: 'spa', unitPrice: 120, currency: 'FCFA', unit: 'séance', icon: 'sparkles' },
  { id: 's5', name: 'Massage relaxant', nameEn: 'Relaxing massage', category: 'spa', unitPrice: 95, currency: 'FCFA', unit: 'séance', icon: 'heart' },
  { id: 's6', name: 'Transfert aéroport', nameEn: 'Airport transfer', category: 'transport', unitPrice: 75, currency: 'FCFA', unit: 'trajet', icon: 'car' },
  { id: 's7', name: 'Location véhicule', nameEn: 'Car rental', category: 'transport', unitPrice: 150, currency: 'FCFA', unit: 'jour', icon: 'car' },
  { id: 's8', name: 'Pressing', nameEn: 'Dry cleaning', category: 'divers', unitPrice: 30, currency: 'FCFA', unit: 'pièce', icon: 'shirt' },
  { id: 's9', name: 'Mini-bar', nameEn: 'Mini-bar', category: 'restauration', unitPrice: 18, currency: 'FCFA', unit: 'article', icon: 'wine' },
  { id: 's10', name: 'Accès piscine privée', nameEn: 'Private pool access', category: 'spa', unitPrice: 60, currency: 'FCFA', unit: 'jour', icon: 'waves' },
]

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const ROOMS: Room[] = [
  // Étage 1 — Standards
  { id: 'r101', number: '101', floor: 1, type: 'standard', status: 'occupee', capacity: 2, basePrice: 120, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'coffre-fort'], description: 'Chambre standard avec vue sur cour', descriptionEn: 'Standard room with courtyard view', surface: 22, view: 'cour', currentGuestId: 'g1', currentReservationId: 'res1' },
  { id: 'r102', number: '102', floor: 1, type: 'standard', status: 'libre', capacity: 2, basePrice: 120, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv'], description: 'Chambre standard calme', descriptionEn: 'Quiet standard room', surface: 22, view: 'cour', lastCleaned: '2026-05-23T08:30:00' },
  { id: 'r103', number: '103', floor: 1, type: 'standard', status: 'nettoyage', capacity: 2, basePrice: 120, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'coffre-fort'], description: 'Chambre standard vue jardin', descriptionEn: 'Standard room garden view', surface: 24, view: 'jardin' },
  { id: 'r104', number: '104', floor: 1, type: 'deluxe', status: 'libre', capacity: 2, basePrice: 180, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar'], description: 'Chambre deluxe vue jardin', descriptionEn: 'Deluxe room garden view', surface: 32, view: 'jardin', lastCleaned: '2026-05-23T09:00:00' },
  { id: 'r105', number: '105', floor: 1, type: 'standard', status: 'travaux', capacity: 1, basePrice: 100, currency: 'FCFA', amenities: ['wifi', 'tv'], description: 'Chambre simple en rénovation', descriptionEn: 'Single room under renovation', surface: 18, view: 'rue' },

  // Étage 2 — Deluxe
  { id: 'r201', number: '201', floor: 2, type: 'deluxe', status: 'occupee', capacity: 2, basePrice: 195, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar', 'coffre-fort'], description: 'Deluxe avec balcon vue panoramique', descriptionEn: 'Deluxe with panoramic balcony', surface: 35, view: 'panoramique', currentGuestId: 'g2', currentReservationId: 'res2' },
  { id: 'r202', number: '202', floor: 2, type: 'deluxe', status: 'libre', capacity: 2, basePrice: 185, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar'], description: 'Chambre deluxe élégante', descriptionEn: 'Elegant deluxe room', surface: 33, view: 'jardin', lastCleaned: '2026-05-23T07:45:00' },
  { id: 'r203', number: '203', floor: 2, type: 'deluxe', status: 'nettoyage', capacity: 2, basePrice: 190, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar', 'coffre-fort'], description: 'Deluxe avec coin salon', descriptionEn: 'Deluxe with lounge area', surface: 38, view: 'jardin' },
  { id: 'r204', number: '204', floor: 2, type: 'deluxe', status: 'occupee', capacity: 3, basePrice: 200, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'douche-italienne', 'minibar', 'coffre-fort'], description: 'Deluxe familiale', descriptionEn: 'Family deluxe room', surface: 40, view: 'rue', currentGuestId: 'g3', currentReservationId: 'res3' },
  { id: 'r205', number: '205', floor: 2, type: 'suite', status: 'libre', capacity: 2, basePrice: 350, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire-jacuzzi', 'minibar', 'coffre-fort', 'salon-privé'], description: 'Suite junior avec jacuzzi', descriptionEn: 'Junior suite with jacuzzi', surface: 55, view: 'panoramique', lastCleaned: '2026-05-23T08:00:00' },

  // Étage 3 — Suites
  { id: 'r301', number: '301', floor: 3, type: 'suite', status: 'occupee', capacity: 4, basePrice: 420, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire-jacuzzi', 'minibar', 'coffre-fort', 'salon', 'terrasse'], description: 'Suite prestige avec terrasse', descriptionEn: 'Prestige suite with terrace', surface: 75, view: 'panoramique', currentGuestId: 'g4', currentReservationId: 'res4' },
  { id: 'r302', number: '302', floor: 3, type: 'suite', status: 'libre', capacity: 2, basePrice: 390, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar', 'coffre-fort', 'salon'], description: 'Suite classic avec salon séparé', descriptionEn: 'Classic suite with separate lounge', surface: 65, view: 'jardin', lastCleaned: '2026-05-22T14:00:00' },
  { id: 'r303', number: '303', floor: 3, type: 'prestige', status: 'occupee', capacity: 2, basePrice: 650, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire-marble', 'minibar-premium', 'coffre-fort', 'salon', 'terrasse-privée', 'butler'], description: 'Suite Royale — expérience ultime', descriptionEn: 'Royal Suite — ultimate experience', surface: 110, view: 'panoramique', currentGuestId: 'g5', currentReservationId: 'res5' },
  { id: 'r304', number: '304', floor: 3, type: 'prestige', status: 'nettoyage', capacity: 4, basePrice: 580, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire', 'minibar-premium', 'coffre-fort', 'salon', 'cuisine-équipée'], description: 'Suite appartement grand luxe', descriptionEn: 'Grand luxury apartment suite', surface: 95, view: 'panoramique' },

  // Étage 4 — Prestige
  { id: 'r401', number: '401', floor: 4, type: 'prestige', status: 'libre', capacity: 2, basePrice: 750, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire-marble', 'minibar-premium', 'coffre-fort', 'salon', 'terrasse-privée', 'butler', 'piscine-privée'], description: 'Suite Penthouse — vue 360°', descriptionEn: 'Penthouse Suite — 360° view', surface: 150, view: 'panoramique', lastCleaned: '2026-05-22T16:00:00' },
  { id: 'r402', number: '402', floor: 4, type: 'prestige', status: 'occupee', capacity: 2, basePrice: 680, currency: 'FCFA', amenities: ['wifi', 'climatisation', 'tv', 'baignoire-marble', 'minibar-premium', 'coffre-fort', 'salon', 'terrasse'], description: 'Suite Grand Palais', descriptionEn: 'Grand Palace Suite', surface: 120, view: 'panoramique', currentGuestId: 'g6', currentReservationId: 'res6' },
]

// ─── Guests ───────────────────────────────────────────────────────────────────

export const GUESTS: Guest[] = [
  { id: 'g1', firstName: 'Sophie', lastName: 'Marchand', email: 'sophie.marchand@email.fr', phone: '0612345678', nationality: 'Française', idNumber: 'FR12345678', address: '15 Rue de la Paix', city: 'Paris', country: 'France', createdAt: '2025-01-15', vip: false, notes: 'Allergie aux fruits de mer', totalStays: 3, totalSpent: 890, preferredRoomType: 'standard', language: 'fr' },
  { id: 'g2', firstName: 'James', lastName: 'Wellington', email: 'j.wellington@corporate.uk', phone: '+441234567890', nationality: 'Britannique', idNumber: 'GB87654321', address: '42 Mayfair Street', city: 'London', country: 'United Kingdom', createdAt: '2025-03-10', vip: true, notes: 'Client corporate, préfère chambre côté jardin', totalStays: 12, totalSpent: 18400, preferredRoomType: 'deluxe', language: 'en' },
  { id: 'g3', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@gmail.com', phone: '+34612345678', nationality: 'Espagnole', idNumber: 'ES98765432', address: 'Calle Mayor 8', city: 'Madrid', country: 'Espagne', createdAt: '2025-06-22', vip: false, notes: '', totalStays: 1, totalSpent: 1200, language: 'fr' },
  { id: 'g4', firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'ahmed.rashid@dubai.ae', phone: '+97150123456', nationality: 'Émirati', idNumber: 'AE11223344', address: 'Palm Jumeirah', city: 'Dubai', country: 'Émirats Arabes', createdAt: '2024-11-01', vip: true, notes: 'VIP Gold — suite minimum, champagne à l\'arrivée, butler 24h', totalStays: 8, totalSpent: 42000, preferredRoomType: 'prestige', language: 'en' },
  { id: 'g5', firstName: 'Charlotte', lastName: 'Dubois', email: 'c.dubois@luxe.fr', phone: '0698765432', nationality: 'Française', idNumber: 'FR99887766', address: '8 Avenue Montaigne', city: 'Paris', country: 'France', createdAt: '2024-09-15', vip: true, notes: 'Cliente fidèle — offrir bouquet à l\'arrivée', totalStays: 15, totalSpent: 28500, preferredRoomType: 'prestige', language: 'fr' },
  { id: 'g6', firstName: 'Hans', lastName: 'Müller', email: 'h.muller@biz.de', phone: '+4915123456789', nationality: 'Allemand', idNumber: 'DE55443322', address: 'Bahnhofstr. 22', city: 'Munich', country: 'Allemagne', createdAt: '2025-02-28', vip: false, notes: 'Arrive toujours tard le soir', totalStays: 4, totalSpent: 3200, preferredRoomType: 'deluxe', language: 'en' },
  { id: 'g7', firstName: 'Isabelle', lastName: 'Fontaine', email: 'i.fontaine@media.fr', phone: '0755443322', nationality: 'Française', idNumber: 'FR44556677', address: '22 Rue du Faubourg', city: 'Lyon', country: 'France', createdAt: '2025-04-05', vip: false, notes: '', totalStays: 2, totalSpent: 650, language: 'fr' },
  { id: 'g8', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.t@corp.jp', phone: '+810312345678', nationality: 'Japonaise', idNumber: 'JP77665544', address: 'Shibuya-ku', city: 'Tokyo', country: 'Japon', createdAt: '2025-05-01', vip: true, notes: 'Préfère chambre non-fumeur, thé vert à disposition', totalStays: 5, totalSpent: 9800, preferredRoomType: 'suite', language: 'en' },
]

// ─── Reservations ─────────────────────────────────────────────────────────────

export const RESERVATIONS: Reservation[] = [
  {
    id: 'res1', guestId: 'g1', roomId: 'r101', checkIn: '2026-05-20', checkOut: '2026-05-25',
    status: 'confirmee', adults: 2, children: 0, totalAmount: 600, currency: 'FCFA', paidAmount: 600,
    notes: 'Arrivée tardive prévue 22h', createdAt: '2026-04-10', confirmedAt: '2026-04-10',
    source: 'direct', invoiceNumber: 'FAC-2026-0042',
    services: [
      { service: SERVICES[0], quantity: 4, date: '2026-05-21' },
      { service: SERVICES[2], quantity: 1, date: '2026-05-22' },
    ],
  },
  {
    id: 'res2', guestId: 'g2', roomId: 'r201', checkIn: '2026-05-22', checkOut: '2026-05-26',
    status: 'confirmee', adults: 1, children: 0, totalAmount: 1560, currency: 'FCFA', paidAmount: 780,
    notes: 'Facture au nom de Corporate Solutions Ltd', createdAt: '2026-05-01', confirmedAt: '2026-05-01',
    source: 'telephone', invoiceNumber: 'FAC-2026-0043',
    services: [
      { service: SERVICES[0], quantity: 4, date: '2026-05-23' },
      { service: SERVICES[5], quantity: 1, date: '2026-05-22' },
      { service: SERVICES[3], quantity: 1, date: '2026-05-24' },
    ],
  },
  {
    id: 'res3', guestId: 'g3', roomId: 'r204', checkIn: '2026-05-21', checkOut: '2026-05-24',
    status: 'confirmee', adults: 2, children: 1, totalAmount: 810, currency: 'FCFA', paidAmount: 810,
    notes: '', createdAt: '2026-05-10', confirmedAt: '2026-05-10',
    source: 'booking', invoiceNumber: 'FAC-2026-0044',
    services: [{ service: SERVICES[0], quantity: 6, date: '2026-05-22' }],
  },
  {
    id: 'res4', guestId: 'g4', roomId: 'r301', checkIn: '2026-05-18', checkOut: '2026-05-28',
    status: 'confirmee', adults: 2, children: 0, totalAmount: 6800, currency: 'FCFA', paidAmount: 6800,
    notes: 'Suite premium — accueil VIP, champagne Dom Pérignon, butler H24',
    createdAt: '2026-04-01', confirmedAt: '2026-04-01', source: 'direct',
    invoiceNumber: 'FAC-2026-0040',
    services: [
      { service: SERVICES[3], quantity: 3, date: '2026-05-20' },
      { service: SERVICES[4], quantity: 2, date: '2026-05-22' },
      { service: SERVICES[9], quantity: 10, date: '2026-05-18' },
      { service: SERVICES[1], quantity: 4, date: '2026-05-19' },
    ],
  },
  {
    id: 'res5', guestId: 'g5', roomId: 'r303', checkIn: '2026-05-23', checkOut: '2026-05-27',
    status: 'confirmee', adults: 2, children: 0, totalAmount: 3400, currency: 'FCFA', paidAmount: 1700,
    notes: 'Bouquet de bienvenue — roses blanches', createdAt: '2026-05-05', confirmedAt: '2026-05-05',
    source: 'direct', invoiceNumber: 'FAC-2026-0045',
    services: [
      { service: SERVICES[0], quantity: 4, date: '2026-05-24' },
      { service: SERVICES[4], quantity: 2, date: '2026-05-25' },
    ],
  },
  {
    id: 'res6', guestId: 'g6', roomId: 'r402', checkIn: '2026-05-22', checkOut: '2026-05-25',
    status: 'confirmee', adults: 1, children: 0, totalAmount: 2040, currency: 'FCFA', paidAmount: 2040,
    notes: 'Late check-in après 23h', createdAt: '2026-05-15', confirmedAt: '2026-05-15',
    source: 'expedia', invoiceNumber: 'FAC-2026-0046',
    services: [{ service: SERVICES[5], quantity: 1, date: '2026-05-22' }],
  },
  {
    id: 'res7', guestId: 'g7', roomId: 'r102', checkIn: '2026-05-25', checkOut: '2026-05-27',
    status: 'en_attente', adults: 1, children: 0, totalAmount: 240, currency: 'FCFA', paidAmount: 0,
    notes: '', createdAt: '2026-05-20', source: 'booking',
    services: [],
  },
  {
    id: 'res8', guestId: 'g8', roomId: 'r205', checkIn: '2026-05-26', checkOut: '2026-05-31',
    status: 'en_attente', adults: 2, children: 0, totalAmount: 2100, currency: 'FCFA', paidAmount: 1050,
    notes: 'Thé vert japonais à disposition en permanence', createdAt: '2026-05-18',
    source: 'direct', services: [
      { service: SERVICES[3], quantity: 2, date: '2026-05-27' },
      { service: SERVICES[9], quantity: 5, date: '2026-05-26' },
    ],
  },
  {
    id: 'res9', guestId: 'g2', roomId: 'r202', checkIn: '2026-04-10', checkOut: '2026-04-14',
    status: 'terminee', adults: 1, children: 0, totalAmount: 760, currency: 'FCFA', paidAmount: 760,
    notes: '', createdAt: '2026-03-20', confirmedAt: '2026-03-20',
    source: 'telephone', invoiceNumber: 'FAC-2026-0031',
    services: [{ service: SERVICES[0], quantity: 4, date: '2026-04-11' }],
  },
  {
    id: 'res10', guestId: 'g1', roomId: 'r103', checkIn: '2026-03-15', checkOut: '2026-03-18',
    status: 'terminee', adults: 2, children: 0, totalAmount: 360, currency: 'FCFA', paidAmount: 360,
    notes: '', createdAt: '2026-03-01', confirmedAt: '2026-03-01',
    source: 'booking', invoiceNumber: 'FAC-2026-0025',
    services: [],
  },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const ALERTS: Alert[] = [
  { id: 'a1', type: 'checkin', message: 'Check-in prévu — Mme Dubois, Suite 303', messageEn: 'Check-in scheduled — Ms. Dubois, Suite 303', roomId: 'r303', guestId: 'g5', reservationId: 'res5', priority: 'high', createdAt: '2026-05-23T07:00:00', resolved: false },
  { id: 'a2', type: 'nettoyage', message: 'Chambre 103 — nettoyage requis (client parti)', messageEn: 'Room 103 — cleaning required (guest left)', roomId: 'r103', priority: 'medium', createdAt: '2026-05-23T09:15:00', resolved: false },
  { id: 'a3', type: 'paiement', message: 'Solde impayé — M. Wellington (res2) : 780 €', messageEn: 'Outstanding balance — Mr. Wellington (res2): €780', guestId: 'g2', reservationId: 'res2', priority: 'high', createdAt: '2026-05-23T08:00:00', resolved: false },
  { id: 'a4', type: 'vip', message: 'Client VIP — M. Al-Rashid : préférence butler confirmée', messageEn: 'VIP guest — Mr. Al-Rashid: butler preference confirmed', guestId: 'g4', reservationId: 'res4', priority: 'urgent', createdAt: '2026-05-23T06:30:00', resolved: false },
  { id: 'a5', type: 'maintenance', message: 'Chambre 105 — travaux ascenseur, durée estimée 3 jours', messageEn: 'Room 105 — elevator works, estimated 3 days', roomId: 'r105', priority: 'low', createdAt: '2026-05-22T14:00:00', resolved: false },
  { id: 'a6', type: 'checkout', message: 'Check-out aujourd\'hui — M. Santos, chambre 204', messageEn: 'Check-out today — Ms. Santos, room 204', roomId: 'r204', guestId: 'g3', reservationId: 'res3', priority: 'medium', createdAt: '2026-05-23T06:00:00', resolved: true },
  { id: 'a7', type: 'nettoyage', message: 'Chambre 304 — nettoyage prioritaire (suite prestige)', messageEn: 'Room 304 — priority cleaning (prestige suite)', roomId: 'r304', priority: 'high', createdAt: '2026-05-23T10:00:00', resolved: false },
]

// ─── Timeline Events ───────────────────────────────────────────────────────────

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'te1', type: 'checkin', title: 'Arrivée Al-Rashid', titleEn: 'Al-Rashid Check-in', description: 'Suite 301 — VIP accueil champagne', time: '2026-05-23T14:00:00', guestId: 'g4', roomId: 'r301', reservationId: 'res4' },
  { id: 'te2', type: 'checkout', title: 'Départ Santos', titleEn: 'Santos Check-out', description: 'Chambre 204 — départ 11h', time: '2026-05-23T11:00:00', guestId: 'g3', roomId: 'r204', reservationId: 'res3' },
  { id: 'te3', type: 'service', title: 'Room Service #203', titleEn: 'Room Service #203', description: 'Petit-déjeuner continental x2', time: '2026-05-23T08:30:00', roomId: 'r201', amount: 48 },
  { id: 'te4', type: 'paiement', title: 'Paiement Wellington', titleEn: 'Wellington Payment', description: 'Acompte 50% — virement bancaire', time: '2026-05-23T09:00:00', guestId: 'g2', reservationId: 'res2', amount: 780 },
  { id: 'te5', type: 'alerte', title: 'Alerte nettoyage', titleEn: 'Cleaning alert', description: 'Chambre 103 — priorité haute', time: '2026-05-23T09:15:00', roomId: 'r103' },
  { id: 'te6', type: 'checkin', title: 'Arrivée Dubois', titleEn: 'Dubois Check-in', description: 'Suite Royale 303 — accueil bouquet', time: '2026-05-23T15:30:00', guestId: 'g5', roomId: 'r303', reservationId: 'res5' },
  { id: 'te7', type: 'service', title: 'Spa Tanaka', titleEn: 'Tanaka Spa', description: 'Soin 60 min — réservation confirmée', time: '2026-05-23T16:00:00', guestId: 'g8', amount: 120 },
  { id: 'te8', type: 'note', title: 'Note équipe', titleEn: 'Team note', description: 'Réunion hebdo à 17h — salle de réunion 2', time: '2026-05-23T10:00:00' },
  { id: 'te9', type: 'paiement', title: 'Solde Müller', titleEn: 'Müller Balance', description: 'Paiement total — CB Visa', time: '2026-05-23T11:30:00', guestId: 'g6', reservationId: 'res6', amount: 2040 },
  { id: 'te10', type: 'checkout', title: 'Départ Marchand', titleEn: 'Marchand Check-out', description: 'Chambre 101 — départ 25 mai', time: '2026-05-25T11:00:00', guestId: 'g1', roomId: 'r101', reservationId: 'res1' },
]

// ─── Daily Revenue ────────────────────────────────────────────────────────────

export const DAILY_REVENUE: DailyRevenue[] = [
  { date: '2026-05-17', rooms: 2840, services: 420, total: 3260 },
  { date: '2026-05-18', rooms: 3120, services: 680, total: 3800 },
  { date: '2026-05-19', rooms: 3560, services: 850, total: 4410 },
  { date: '2026-05-20', rooms: 4200, services: 1200, total: 5400 },
  { date: '2026-05-21', rooms: 4800, services: 960, total: 5760 },
  { date: '2026-05-22', rooms: 5200, services: 1450, total: 6650 },
  { date: '2026-05-23', rooms: 4950, services: 1380, total: 6330 },
]

// ─── Hotel Users ──────────────────────────────────────────────────────────────

export const HOTEL_USERS: HotelUser[] = [
  { id: 'u1', firstName: 'Gérard', lastName: 'Lefèvre', email: 'g.lefevre@grandhotel.fr', role: 'admin', active: true, createdAt: '2020-01-01', department: 'Direction' },
  { id: 'u2', firstName: 'Camille', lastName: 'Renard', email: 'c.renard@grandhotel.fr', role: 'manager', active: true, createdAt: '2021-03-15', department: 'Réception' },
  { id: 'u3', firstName: 'Lucas', lastName: 'Bernard', email: 'l.bernard@grandhotel.fr', role: 'receptionist', active: true, createdAt: '2022-06-01', department: 'Réception' },
  { id: 'u4', firstName: 'Fatima', lastName: 'Benali', email: 'f.benali@grandhotel.fr', role: 'housekeeper', active: true, createdAt: '2022-09-15', department: 'Housekeeping' },
  { id: 'u5', firstName: 'Pierre', lastName: 'Moreau', email: 'p.moreau@grandhotel.fr', role: 'receptionist', active: false, createdAt: '2023-01-10', department: 'Réception' },
]

// ─── Pricing Rules ────────────────────────────────────────────────────────────

export const PRICING_RULES: PricingRule[] = [
  { id: 'pr1', roomType: 'standard', season: 'haute', startDate: '2026-07-01', endDate: '2026-08-31', pricePerNight: 160 },
  { id: 'pr2', roomType: 'deluxe', season: 'haute', startDate: '2026-07-01', endDate: '2026-08-31', pricePerNight: 250 },
  { id: 'pr3', roomType: 'suite', season: 'haute', startDate: '2026-07-01', endDate: '2026-08-31', pricePerNight: 520 },
  { id: 'pr4', roomType: 'prestige', season: 'haute', startDate: '2026-07-01', endDate: '2026-08-31', pricePerNight: 950 },
  { id: 'pr5', roomType: 'standard', season: 'basse', startDate: '2026-11-01', endDate: '2027-03-31', pricePerNight: 90 },
  { id: 'pr6', roomType: 'deluxe', season: 'basse', startDate: '2026-11-01', endDate: '2027-03-31', pricePerNight: 140 },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

export const HOTEL_STATS: HotelStats = {
  occupancyRate: 62.5,
  totalRooms: 16,
  occupiedRooms: 7,
  freeRooms: 6,
  cleaningRooms: 3,
  maintenanceRooms: 1,
  todayCheckIns: 2,
  todayCheckOuts: 1,
  todayRevenue: 6330,
  monthRevenue: 142800,
  pendingAlerts: 6,
}
