import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createViolation,
  getViolationById,
  getViolations,
  getViolationsSummary,
  lookupViolation,
  updateViolationStatus,
  type CreateViolationInput,
  type ViolationFilters,
} from "@/services/violationService";
import type { Violation } from "@/types/violation";

export const violationKeys = {
  all: ["violations"] as const,
  lists: () => [...violationKeys.all, "list"] as const,
  list: (filters: ViolationFilters) =>
    [...violationKeys.lists(), filters] as const,
  details: () => [...violationKeys.all, "detail"] as const,
  detail: (id: string) => [...violationKeys.details(), id] as const,
  summary: () => [...violationKeys.all, "summary"] as const,
  lookup: (plate: string, date: string) =>
    [...violationKeys.all, "lookup", plate, date] as const,
};

export function useViolations(filters: ViolationFilters = {}) {
  return useQuery({
    queryKey: violationKeys.list(filters),
    queryFn: () => getViolations(filters),
  });
}

export function useViolation(id: string) {
  return useQuery({
    queryKey: violationKeys.detail(id),
    queryFn: () => getViolationById(id),
    enabled: !!id,
  });
}

export function useViolationsSummary() {
  return useQuery({
    queryKey: violationKeys.summary(),
    queryFn: getViolationsSummary,
  });
}

export function useViolationLookup(licensePlate: string, date: string) {
  const enabled =
    licensePlate.trim().length >= 4 && /\d{4}-\d{2}-\d{2}/.test(date);
  return useQuery({
    queryKey: violationKeys.lookup(licensePlate, date),
    queryFn: () => lookupViolation(licensePlate, date),
    enabled,
  });
}

export function useCreateViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateViolationInput) => createViolation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: violationKeys.lists() });
      qc.invalidateQueries({ queryKey: violationKeys.summary() });
    },
  });
}

export function useUpdateViolationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Violation["status"] }) =>
      updateViolationStatus(id, status),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: violationKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: violationKeys.lists() });
      qc.invalidateQueries({ queryKey: violationKeys.summary() });
    },
  });
}
