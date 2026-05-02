import { apiRequest } from "@/services/api";
import { getAuthHeader } from "@/services/authHeader";
import type { Vehicle } from "@/types/vehicle";

export async function getVehicles(): Promise<Vehicle[]> {
  return apiRequest<Vehicle[]>("/fleet", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/fleet/${id}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export interface CreateVehicleInput {
  slug: string;
  name: string;
  brand: string;
  category: string;
  year: number;
  mileage: number;
  licensePlate: string;
  dailyRate: number;
  fuelType: string;
  transmission: string;
  seats: number;
  color: string;
  features: string[];
  quantity?: number;
  includedKm?: number;
  extraKmRate?: number;
}

export async function createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
  return apiRequest<Vehicle>("/fleet", {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export interface UpdateVehicleInput {
  name?: string;
  status?: string;
  mileage?: number;
  licensePlate?: string;
  dailyRate?: number;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  color?: string;
  features?: string[];
  quantity?: number;
  includedKm?: number;
  extraKmRate?: number;
}

export async function updateVehicle(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/fleet/${id}`, {
    method: "PATCH",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteVehicle(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/fleet/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
}
