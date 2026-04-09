import type { Vehicle } from '@/types/vehicle';
import type { Client } from '@/types/client';
import { mockVehicles } from './vehicles';
import { mockClients } from './clients';
import { mockBookings } from './bookings';

// ── Helpers ─────────────────────────────────────────────────────────────────

function findVehicle(id: string): Vehicle {
  return mockVehicles.find((v) => v.id === id) ?? mockVehicles[0];
}

function findClient(id: string): Client {
  return mockClients.find((c) => c.id === id) ?? mockClients[0];
}

// ── Active Rentals (from bookings with status 'active') ─────────────────────

export interface ActiveRental {
  id: string;
  vehicle: Vehicle;
  client: Client;
  startDate: string;
  returnDate: string;
  bookingId: string;
}

const activeBookingsList = mockBookings.filter((b) => b.status === 'active');

export const activeRentals: ActiveRental[] = activeBookingsList.map((b) => ({
  id: b.id,
  vehicle: findVehicle(b.vehicleId),
  client: findClient(b.clientId),
  startDate: b.startDate,
  returnDate: b.endDate,
  bookingId: b.id,
}));

// ── Returning Today (vehicles due back 2026-04-08) ──────────────────────────

export interface UpcomingReturn {
  id: string;
  vehicle: Vehicle;
  client: Client;
  returnTime: string;
  bookingId: string;
}

export const upcomingReturns: UpcomingReturn[] = [
  { id: 'ur1', vehicle: findVehicle('v5'),  client: findClient('c3'), returnTime: '10:00', bookingId: 'bk2' },
  { id: 'ur2', vehicle: findVehicle('v11'), client: findClient('c2'), returnTime: '14:00', bookingId: 'bk3' },
  { id: 'ur3', vehicle: findVehicle('v14'), client: findClient('c4'), returnTime: '16:30', bookingId: 'bk4' },
];

// ── Fleet Stats ─────────────────────────────────────────────────────────────

export interface FleetStats {
  total: number;
  rented: number;
  available: number;
  maintenance: number;
}

export const fleetStats: FleetStats = {
  total: 22,
  rented: 10,
  available: 9,
  maintenance: 3,
};

// ── Recent Activity ─────────────────────────────────────────────────────────

export type ActivityType =
  | 'inspection_completed'
  | 'booking_created'
  | 'vehicle_returned'
  | 'violation_logged'
  | 'contract_signed';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  vehicleName?: string;
  clientName?: string;
  timestamp: string;
}

export const recentActivity: ActivityItem[] = [
  { id: 'act1', type: 'inspection_completed', description: 'Inspection terminée sur BMW X1', vehicleName: 'BMW X1', timestamp: '2026-04-08T06:30:00' },
  { id: 'act2', type: 'booking_created', description: 'Nouvelle réservation — Range Rover', vehicleName: 'Range Rover', clientName: 'Claire Martin', timestamp: '2026-04-08T04:15:00' },
  { id: 'act3', type: 'vehicle_returned', description: 'BMW X3 retourné par Antoine Moreau', vehicleName: 'BMW X3', clientName: 'Antoine Moreau', timestamp: '2026-04-07T17:45:00' },
  { id: 'act4', type: 'contract_signed', description: 'Contrat signé — Kodiaq 7 Places', vehicleName: 'Kodiaq 7 Seater', clientName: 'Youssef El Amrani', timestamp: '2026-04-07T14:20:00' },
  { id: 'act5', type: 'violation_logged', description: 'Infraction enregistrée — Golf', vehicleName: 'Golf', timestamp: '2026-04-07T11:00:00' },
  { id: 'act6', type: 'booking_created', description: 'Nouvelle réservation — Classe V', vehicleName: 'Classe V', clientName: 'Karim Haddad', timestamp: '2026-04-07T09:30:00' },
  { id: 'act7', type: 'inspection_completed', description: 'Inspection terminée sur Tayron R', vehicleName: 'Tayron R', timestamp: '2026-04-06T16:15:00' },
  { id: 'act8', type: 'vehicle_returned', description: 'Audi Q5 retourné par Mehdi Benali', vehicleName: 'Audi Q5', clientName: 'Mehdi Benali', timestamp: '2026-04-06T14:00:00' },
  { id: 'act9', type: 'contract_signed', description: 'Contrat signé — GLC Coupé', vehicleName: 'GLC Coupé', clientName: 'Isabelle Leroy', timestamp: '2026-04-06T10:45:00' },
  { id: 'act10', type: 'violation_logged', description: 'Infraction enregistrée — Vito', vehicleName: 'Vito', timestamp: '2026-04-06T08:20:00' },
];
