import { mockBookings } from '@/data/bookings';
import { mockVehicles } from '@/data/vehicles';
import type { Booking } from '@/types/booking';
import type { Vehicle } from '@/types/vehicle';

interface LookupResult {
  vehicle: Vehicle | null;
  booking: Booking | null;
  clientName: string | null;
  clientId: string | null;
}

export function identifyClient(licensePlate: string, violationDate: string): LookupResult {
  const vehicle = mockVehicles.find((v) => v.licensePlate === licensePlate) ?? null;

  if (!vehicle) {
    return { vehicle: null, booking: null, clientName: null, clientId: null };
  }

  const date = new Date(violationDate);

  const booking =
    mockBookings.find(
      (b) =>
        b.vehicleId === vehicle.id &&
        (b.status === 'active' || b.status === 'completed') &&
        new Date(b.startDate) <= date &&
        date <= new Date(b.endDate),
    ) ?? null;

  return {
    vehicle,
    booking,
    clientName: booking?.clientName ?? null,
    clientId: booking?.clientId ?? null,
  };
}
