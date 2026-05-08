export type InvoiceKind = "rental" | "damages";

export type InvoiceStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "partially-paid"
  | "refund_pending"
  | "refunded"
  | "void";

// Re-exported for legacy callers. New code should import from "@/types/payment".
export type { PaymentMethod } from "./payment";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  /** In cents. May be negative on credit lines (e.g. deposit applied to damages). */
  unitPrice: number;
  /** In cents. May be negative on credit lines. */
  total: number;
}

export interface Invoice {
  id: string;
  reference: string; // INV-RENT-2026-XXXX or INV-DMG-2026-XXXX
  /** Rental invoices issue at booking confirmation; damages invoices issue at close. */
  kind: InvoiceKind;
  bookingId: string | null;
  vehicleId: string;
  vehicleName: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  /** In cents. */
  subtotal: number;
  /** In cents. Damages-kind only; 0 on rental invoices. */
  damageCharges: number;
  /** In cents. Damages-kind only. */
  lateReturnFee: number;
  /** In cents. Damages-kind only. */
  violationCharges: number;
  /** In cents. Signed: negative on damages invoices when deposit > damages (refund owed). */
  totalDue: number;
  /** In cents. Aggregated from the payment ledger; readers shouldn't recompute. */
  amountPaid: number;
  /** In cents. Signed; mirrors totalDue sign convention. */
  remainingBalance: number;
  notes: string;
}

export interface PricingConfig {
  weekendSurcharge: number;
  highSeasonMultiplier: number;
  highSeasonMonths: number[];
  longRentalDiscounts: { minDays: number; discount: number }[];
}
