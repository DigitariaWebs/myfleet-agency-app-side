import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInspection,
  getInspectionById,
  listInspections,
  patchInspection,
  runInspectionAi,
  type CreateInspectionPayload,
} from "@/services/inspectionService";
import type { InspectionType } from "@/types/inspection";

export interface InspectionListFilters {
  vehicleId?: string;
  bookingId?: string;
  type?: InspectionType;
}

export const inspectionKeys = {
  all: ["inspections"] as const,
  list: (filters?: InspectionListFilters) =>
    [...inspectionKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...inspectionKeys.all, "detail", id] as const,
};

export function useInspections(filters?: InspectionListFilters) {
  return useQuery({
    queryKey: inspectionKeys.list(filters),
    queryFn: async () => (await listInspections(filters)).data ?? [],
    staleTime: 30_000,
  });
}

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: inspectionKeys.detail(id ?? "_"),
    queryFn: async () => (await getInspectionById(id as string)).data,
    enabled: typeof id === "string" && id.length > 0,
    staleTime: 30_000,
    // Poll every 3s while the backend AI run is in flight so the UI
    // reflects completion without the user having to pull-to-refresh.
    refetchInterval: (query) => {
      const status = query.state.data?.aiStatus;
      return status === "queued" || status === "running" ? 3000 : false;
    },
  });
}

export function useRunInspectionAi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await runInspectionAi(id);
      if (!res.data) throw new Error("Failed to run AI analysis");
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(inspectionKeys.detail(data.id), data);
      void qc.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInspectionPayload) => {
      const res = await createInspection(payload);
      if (!res.data) throw new Error("Failed to create inspection");
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inspectionKeys.all });
    },
  });
}

export function usePatchInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: {
        status?: "draft" | "completed";
        mileage?: number;
        fuelLevel?: number;
        notes?: string;
      };
    }) => {
      const res = await patchInspection(id, patch);
      if (!res.data) throw new Error("Failed to update inspection");
      return res.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: inspectionKeys.all });
      qc.setQueryData(inspectionKeys.detail(data.id), data);
    },
  });
}
