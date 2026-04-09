import { delay, type ApiResponse } from '@/services/api';
import type { Violation } from '@/types/violation';
import { mockViolations } from '@/data/violations';

export async function getViolations(): Promise<ApiResponse<Violation[]>> {
  await delay();
  return { data: mockViolations, success: true };
}

export async function createViolation(data: Omit<Violation, 'id'>): Promise<ApiResponse<Violation>> {
  await delay();
  return { data: { ...data, id: `vio-${Date.now()}` }, success: true, message: 'Violation logged' };
}

export async function updateViolation(id: string, data: Partial<Omit<Violation, 'id'>>): Promise<ApiResponse<Violation>> {
  await delay();
  const existing = mockViolations.find((v) => v.id === id);
  if (!existing) return { data: {} as Violation, success: false, message: `Violation "${id}" not found` };
  return { data: { ...existing, ...data }, success: true, message: 'Updated' };
}
