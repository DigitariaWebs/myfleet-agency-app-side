export type ViolationType = 'speeding' | 'parking' | 'redlight' | 'other';

export type ViolationStatus =
  | 'received'
  | 'client-identified'
  | 'forwarded'
  | 'paid'
  | 'disputed';

export interface Violation {
  id: string;
  reference: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  bookingId: string | null;
  clientId: string | null;
  clientName: string | null;
  type: ViolationType;
  date: string;
  receivedDate: string;
  fineAmount: number;
  adminFee: number;
  totalCharge: number;
  location: string;
  status: ViolationStatus;
  description: string;
  notes: string;
}
