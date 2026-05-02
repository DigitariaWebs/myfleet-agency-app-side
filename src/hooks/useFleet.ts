import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from "@/services/fleetService";
import type { Vehicle } from "@/types/vehicle";

export const fleetKeys = {
  all: ["fleet"] as const,
  lists: () => [...fleetKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...fleetKeys.lists(), filters] as const,
  details: () => [...fleetKeys.all, "detail"] as const,
  detail: (id: string) => [...fleetKeys.details(), id] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: fleetKeys.lists(),
    queryFn: getVehicles,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: fleetKeys.detail(id),
    queryFn: () => getVehicleById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleInput) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleInput }) =>
      updateVehicle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
      queryClient.removeQueries({ queryKey: fleetKeys.detail(id) });
    },
  });
}
