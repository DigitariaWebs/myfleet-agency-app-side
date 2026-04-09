export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface BookingOption {
  id: string;
  label: string;
  price: number;
  enabled: boolean;
}

export interface PricingBreakdown {
  dailyRate: number;
  days: number;
  subtotal: number;
  options: BookingOption[];
  optionsTotal: number;
  deposit: number;
  total: number;
}

export interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  completed: boolean;
  active: boolean;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  dailyRate: number;
  totalAmount: number;
  deposit: number;
  pickupLocation: string;
  returnLocation: string;
  pickupTime: string;
  returnTime: string;
  options: BookingOption[];
  notes: string;
  createdAt: string;

  // Payment fields
  paymentLink?: string;
  paymentLinkSentAt?: string;
  paymentLinkExpiresAt?: string;
  paymentStatus?: 'pending' | 'link_sent' | 'paid' | 'expired' | 'failed';

  // Insurance fields
  insurance?: {
    tier: 'basic' | 'all_inclusive';
    dailyRate: number;        // 0 for basic, 25 for all-inclusive (CHF)
    totalCost: number;        // dailyRate * rentalDays
    excess: number;           // 1500 for basic, 0 for all-inclusive
  };

  // Auto-cancel
  autoCancelAt?: string;

  // Workflow linkage
  workflow?: {
    pickupStartedAt?: string;
    pickupCompletedAt?: string;
    returnStartedAt?: string;
    returnCompletedAt?: string;
    preInspectionId?: string;
    postInspectionId?: string;
    contractId?: string;
    returnContractId?: string;
  };
}

export interface BookingDraft {
  vehicleId: string | null;
  vehicleName: string | null;
  clientId: string | null;
  clientName: string | null;
  startDate: string | null;
  endDate: string | null;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  options: BookingOption[];
  notes: string;
  insuranceTier?: 'basic' | 'all_inclusive';
}
