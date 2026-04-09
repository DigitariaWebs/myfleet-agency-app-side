export interface AgencySettings {
  defaultLanguage: 'fr' | 'en';
  invoicePrefix: string;
  adminFee: number;
  weekendSurcharge: number;
  highSeasonMultiplier: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  autoReminders: boolean;
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
    monthlyPrice: number;
  };
  settings: AgencySettings;
  createdAt: string;
}

export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  lastActive: string;
}
