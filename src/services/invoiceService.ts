import { authedRequest } from "@/services/api";
import type { Invoice } from "@/types/billing";

export interface InvoicesSummary {
  monthlyRevenueCents: number;
  pendingCents: number;
  overdueCents: number;
}

export interface RecordPaymentInput {
  amount: number;
  method: "card" | "cash" | "transfer";
  date?: string;
  reference?: string;
}

export async function getInvoices(): Promise<Invoice[]> {
  return authedRequest<Invoice[]>(`/invoices`, { method: "GET" });
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  return authedRequest<Invoice>(`/invoices/${id}`, { method: "GET" });
}

export async function getInvoicesSummary(): Promise<InvoicesSummary> {
  return authedRequest<InvoicesSummary>(`/invoices/summary`, { method: "GET" });
}

export async function recordPayment(
  id: string,
  data: RecordPaymentInput,
): Promise<Invoice> {
  return authedRequest<Invoice>(`/invoices/${id}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function sendInvoiceReminder(id: string): Promise<void> {
  await authedRequest<{ ok: true }>(`/invoices/${id}/send-reminder`, {
    method: "POST",
  });
}
