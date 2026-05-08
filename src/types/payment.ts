// Authoritative payment ledger entries. Mirrors server PaymentDto.
// Every payment attaches to an invoice (rental or damages). Deposit
// authorizations live on the booking, not here; only their captures
// produce payment rows (against the damages invoice).

export type PaymentKind = "charge" | "refund";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export type PaymentMethod = "card" | "cash" | "transfer" | "other";

export type PaymentProcessor = "stripe" | "manual";

export interface Payment {
  id: string;
  agencyId: string;
  invoiceId: string;
  clientId: string | null;
  kind: PaymentKind;
  parentPaymentId: string | null;
  /** In cents (smallest currency unit). Always positive; refunds carry kind='refund'. */
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  processor: PaymentProcessor;
  processorChargeId: string | null;
  processorCustomerId: string | null;
  processorPaymentMethodId: string | null;
  processorMetadata: Record<string, unknown>;
  notes: string;
  failureReason: string | null;
  initiatedAt: string | null;
  completedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
