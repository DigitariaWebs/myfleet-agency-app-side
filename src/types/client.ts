export type ClientTag = 'vip' | 'corporate' | 'frequent' | 'new' | 'flagged';

export type IDType = 'passport' | 'national-id' | 'driving-license';

export interface ClientStats {
  totalRentals: number;
  totalSpent: number;
  lastRentalDate: string | null;
  avgDuration: number;
  hasActiveBooking: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  idType: IDType;
  idNumber: string;
  driverLicense: string;
  driverLicenseExpiry: string;
  tags: ClientTag[];
  flagReason: string | null;
  totalBookings: number;
  /** In cents (smallest currency unit). */
  totalSpent: number;
  createdAt: string;
  notes: string;
  documents?: {
    idFront?: string;
    idBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    creditCardFront?: string;
  };
  registrationMethod?: 'online' | 'walk-in';
  registeredAt?: string;
}
