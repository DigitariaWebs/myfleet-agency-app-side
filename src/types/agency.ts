export interface DeliverySettings {
  enabled: boolean;
  /** Human-readable label (e.g. "Agence Genève-Centre"). */
  basePointLabel: string;
  /** Raw address the user typed (pre-geocoding). */
  basePointAddress: string;
  /** Geocoded latitude. 0 means "not yet resolved". */
  basePointLat: number;
  /** Geocoded longitude. 0 means "not yet resolved". */
  basePointLng: number;
  /** Cost per driving km in cents (smallest currency unit). */
  ratePerKm: number;
  currency: string;
  /** Optional minimum fee in cents. */
  minFee?: number;
  /** Optional maximum driving distance allowed for delivery. */
  maxDistanceKm?: number;
}

export interface BookingPolicies {
  autoCancelUnpaid: boolean;
  autoCancelAfterHours: number;
}

export interface AgencySettings {
  defaultLanguage: 'fr' | 'en';
  invoicePrefix: string;
  /** In cents (smallest currency unit). */
  adminFee: number;
  /** In cents (smallest currency unit). */
  weekendSurcharge: number;
  highSeasonMultiplier: number;
  highSeasonMonths: number[];
  workingHoursStart: string;
  workingHoursEnd: string;
  autoReminders: boolean;
  delivery: DeliverySettings;
  bookingPolicies: BookingPolicies;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: 'EUR' | 'CHF' | 'USD';
  country: string;
  timezone: string;
  plan: 'starter' | 'professional' | 'enterprise';
  subscription: {
    status: 'active' | 'trial' | 'expired';
    startDate: string;
    nextBillingDate: string;
    /** In cents (smallest currency unit). */
    monthlyPrice: number;
  };
  createdAt: string;
}

export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  lastActive: string;
}

export type AgencyDocumentType = 'kbis' | 'license' | 'insurance';

export interface AgencyDocument {
  type: AgencyDocumentType;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string | null;
  key: string;
}
