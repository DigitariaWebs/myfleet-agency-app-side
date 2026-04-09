import { delay, type ApiResponse } from '@/services/api';
import type { Client } from '@/types/client';
import { mockClients } from '@/data/clients';

export async function getClients(): Promise<ApiResponse<Client[]>> {
  await delay();
  return { data: mockClients, success: true };
}

export async function getClientById(id: string): Promise<ApiResponse<Client | null>> {
  await delay();
  const client = mockClients.find((c) => c.id === id) ?? null;
  if (!client) return { data: null, success: false, message: `Client "${id}" not found` };
  return { data: client, success: true };
}

export async function createClient(data: Omit<Client, 'id'>): Promise<ApiResponse<Client>> {
  await delay();
  return { data: { ...data, id: `c-${Date.now()}` }, success: true, message: 'Client created' };
}

export async function updateClient(id: string, data: Partial<Omit<Client, 'id'>>): Promise<ApiResponse<Client>> {
  await delay();
  const existing = mockClients.find((c) => c.id === id);
  if (!existing) return { data: {} as Client, success: false, message: `Client "${id}" not found` };
  return { data: { ...existing, ...data }, success: true, message: 'Updated' };
}

export async function searchClients(query: string): Promise<ApiResponse<Client[]>> {
  await delay();
  const q = query.toLowerCase();
  const results = mockClients.filter(
    (c) =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q),
  );
  return { data: results, success: true };
}
