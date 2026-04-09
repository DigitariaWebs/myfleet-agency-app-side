import { delay, type ApiResponse } from '@/services/api';
import type { Vehicle } from '@/types/vehicle';
import { mockVehicles } from '@/data/vehicles';

export async function getVehicles(): Promise<ApiResponse<Vehicle[]>> {
  await delay();
  return { data: mockVehicles, success: true };
}

export async function getVehicleById(id: string): Promise<ApiResponse<Vehicle | null>> {
  await delay();
  const vehicle = mockVehicles.find((v) => v.id === id) ?? null;
  if (!vehicle) {
    return { data: null, success: false, message: `Vehicle "${id}" not found` };
  }
  return { data: vehicle, success: true };
}

export async function createVehicle(
  data: Omit<Vehicle, 'id'>
): Promise<ApiResponse<Vehicle>> {
  await delay();
  const newVehicle: Vehicle = { ...data, id: `v-${Date.now()}` };
  return { data: newVehicle, success: true, message: 'Vehicle created' };
}

export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, 'id'>>
): Promise<ApiResponse<Vehicle>> {
  await delay();
  const existing = mockVehicles.find((v) => v.id === id);
  if (!existing) {
    return { data: {} as Vehicle, success: false, message: `Vehicle "${id}" not found` };
  }
  const updated: Vehicle = { ...existing, ...data };
  return { data: updated, success: true, message: 'Vehicle updated' };
}

export async function deleteVehicle(id: string): Promise<ApiResponse<{ id: string }>> {
  await delay();
  const exists = mockVehicles.some((v) => v.id === id);
  if (!exists) {
    return { data: { id }, success: false, message: `Vehicle "${id}" not found` };
  }
  return { data: { id }, success: true, message: 'Vehicle deleted' };
}
