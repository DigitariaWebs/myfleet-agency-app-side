import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInvoiceById,
  getInvoices,
  getInvoicesSummary,
  recordPayment,
  sendInvoiceReminder,
  type RecordPaymentInput,
} from "@/services/invoiceService";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
  summary: () => [...invoiceKeys.all, "summary"] as const,
};

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: getInvoices,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
}

export function useInvoicesSummary() {
  return useQuery({
    queryKey: invoiceKeys.summary(),
    queryFn: getInvoicesSummary,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordPaymentInput }) =>
      recordPayment(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
      qc.invalidateQueries({ queryKey: invoiceKeys.summary() });
    },
  });
}

export function useSendInvoiceReminder() {
  return useMutation({
    mutationFn: (id: string) => sendInvoiceReminder(id),
  });
}
