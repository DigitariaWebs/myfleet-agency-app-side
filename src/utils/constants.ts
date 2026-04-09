/**
 * Application-wide constants for the My Fleet car rental app.
 */

import type { VehicleCategory, FuelType, Transmission } from '@/types/vehicle';
import type { BookingStatus } from '@/types/booking';
import type { InspectionType } from '@/types/inspection';

/** Display name shown in headers and splash screens. */
export const APP_NAME = 'My Fleet' as const;

/** Default ISO 4217 currency code. */
export const DEFAULT_CURRENCY = 'EUR' as const;

/** Default BCP-47 locale tag. */
export const DEFAULT_LOCALE = 'fr-FR' as const;

/** All vehicle categories offered by the fleet. */
export const VEHICLE_CATEGORIES: readonly VehicleCategory[] = [
  'SUV',
  'SUV Compact',
  'Sedan Compact',
  'Van / Minivan',
  'City Car',
  'SUV Coupé',
  'Hatchback',
  'SUV / 7 Places',
  'SUV Luxury',
  'Van / Utilitaire',
] as const;

/** Fuel / powertrain types. */
export const FUEL_TYPES: readonly FuelType[] = [
  'gasoline',
  'diesel',
  'electric',
  'hybrid',
  'plug-in-hybrid',
] as const;

/** Transmission types. */
export const TRANSMISSION_TYPES: readonly Transmission[] = [
  'manual',
  'automatic',
] as const;

/** Lifecycle statuses a booking can hold. */
export const BOOKING_STATUSES: readonly BookingStatus[] = [
  'pending',
  'confirmed',
  'active',
  'completed',
  'cancelled',
] as const;

/** Inspection occasion types. */
export const INSPECTION_TYPES: readonly InspectionType[] = [
  'pre-rental',
  'post-rental',
] as const;

/** Maximum number of photos allowed per inspection report. */
export const MAX_PHOTOS_PER_INSPECTION = 20 as const;
