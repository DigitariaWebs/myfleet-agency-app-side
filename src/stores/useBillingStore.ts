import { create } from 'zustand';
import type { Invoice, InvoiceStatus, PaymentMethod } from '@/types/billing';
import { mockInvoices } from '@/data/billing';

// ── Types ────────────────────────────────────────────────────────────────────

interface BillingState {
  invoices: Invoice[];
}

interface BillingActions {
  getMonthlyRevenue: () => number;
  getPendingAmount: () => number;
  getOverdueAmount: () => number;
  recordPayment: (invoiceId: string, amount: number, method: PaymentMethod) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
}

type BillingStore = BillingState & BillingActions;

// ── Store ────────────────────────────────────────────────────────────────────

export const useBillingStore = create<BillingStore>()((set, get) => ({
  invoices: mockInvoices,

  // ── Queries ──────────────────────────────────────────────────────────────

  getMonthlyRevenue: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    return get()
      .invoices.filter((inv) => inv.status === 'paid')
      .filter((inv) => {
        // Use the last payment date, or issuedDate if no payments recorded
        const dateStr =
          inv.payments.length > 0
            ? inv.payments[inv.payments.length - 1].date
            : inv.issuedDate;
        const d = new Date(dateStr);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, inv) => sum + inv.amountPaid, 0);
  },

  getPendingAmount: () =>
    get()
      .invoices.filter((inv) => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.remainingBalance, 0),

  getOverdueAmount: () =>
    get()
      .invoices.filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.remainingBalance, 0),

  // ── Mutations ────────────────────────────────────────────────────────────

  recordPayment: (invoiceId, amount, method) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const payment = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          amount,
          method,
        };

        const newAmountPaid = inv.amountPaid + amount;
        const newBalance = Math.max(0, inv.totalDue - newAmountPaid);

        const newStatus: InvoiceStatus =
          newBalance === 0 ? 'paid' : 'partially-paid';

        return {
          ...inv,
          payments: [...inv.payments, payment],
          amountPaid: newAmountPaid,
          remainingBalance: newBalance,
          status: newStatus,
        };
      }),
    })),

  updateInvoiceStatus: (id, status) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, status } : inv,
      ),
    })),
}));
