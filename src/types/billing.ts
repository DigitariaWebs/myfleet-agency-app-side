export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'partially-paid';

export type PaymentMethod = 'card' | 'cash' | 'transfer';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
}

export interface Invoice {
  id: string;
  reference: string; // INV-2026-XXXX
  bookingId: string | null;
  vehicleId: string;
  vehicleName: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  deposit: number;
  damageCharges: number;
  lateReturnFee: number;
  violationCharges: number;
  totalDue: number;
  payments: Payment[];
  amountPaid: number;
  remainingBalance: number;
  notes: string;
}

export interface PricingConfig {
  weekendSurcharge: number;
  highSeasonMultiplier: number;
  highSeasonMonths: number[];
  longRentalDiscounts: { minDays: number; discount: number }[];
}
