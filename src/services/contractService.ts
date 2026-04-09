import { delay, type ApiResponse } from '@/services/api';
import type { Contract } from '@/types/contract';
import { mockContracts } from '@/data/contracts';

export async function getContracts(): Promise<ApiResponse<Contract[]>> {
  await delay();
  return { data: mockContracts, success: true };
}

export async function getContractById(id: string): Promise<ApiResponse<Contract | null>> {
  await delay();
  const contract = mockContracts.find((c) => c.id === id) ?? null;
  if (!contract) {
    return { data: null, success: false, message: `Contract "${id}" not found` };
  }
  return { data: contract, success: true };
}

export async function createContract(data: Omit<Contract, 'id'>): Promise<ApiResponse<Contract>> {
  await delay();
  return { data: { ...data, id: `ct-${Date.now()}` }, success: true, message: 'Contract created' };
}
