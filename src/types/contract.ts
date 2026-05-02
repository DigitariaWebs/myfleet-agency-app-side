export type ContractStatus =
  | 'draft'
  | 'pending-signature'
  | 'active'
  | 'expired'
  | 'terminated';

export interface ContractParty {
  name: string;
  address: string;
  phone: string;
  email: string;
  idNumber?: string;
  licenseNumber?: string;
}

export interface ContractVehicleInfo {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileageAtPickup: number;
  fuelLevelAtPickup: number;
  knownDamages: string;
}

export interface SignatureData {
  base64: string;
  signedAt: string;
  signerName: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
}

export interface Contract {
  id: string;
  reference: string; // MF-2026-XXXX
  bookingId: string | null;
  vehicleId: string;
  vehicleName: string;
  clientId: string;
  clientName: string;
  status: ContractStatus;
  createdAt: string;
  startDate: string;
  endDate: string;
  /** In cents (smallest currency unit). */
  dailyRate: number;
  /** In cents. */
  totalAmount: number;
  /** In cents. */
  deposit: number;
  pickupLocation: string;
  returnLocation: string;
  lessor: ContractParty;
  lessee: ContractParty;
  vehicleInfo: ContractVehicleInfo;
  clauses: ContractClause[];
  clientSignature: SignatureData | null;
  agentSignature: SignatureData | null;
  notes: string;
}
