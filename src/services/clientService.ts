import { apiRequest } from "@/services/api";
import { getAuthHeader } from "@/services/authHeader";
import type { Client } from "@/types/client";

export async function getClients(): Promise<Client[]> {
  return apiRequest<Client[]>("/clients", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function getClientById(id: string): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  driverLicense: string;
  driverLicenseExpiry: string;
  notes?: string;
  documents?: {
    idFront?: string;
    idBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    creditCardFront?: string;
  };
  registrationMethod?: string;
}

export async function createClient(data: CreateClientInput): Promise<Client> {
  return apiRequest<Client>("/clients", {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export interface UpdateClientInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  idType?: string;
  idNumber?: string;
  driverLicense?: string;
  driverLicenseExpiry?: string;
  notes?: string;
  tags?: string[];
  flagReason?: string | null;
  documents?: {
    idFront?: string;
    idBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    creditCardFront?: string;
  };
}

export async function updateClient(id: string, data: UpdateClientInput): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`, {
    method: "PATCH",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/clients/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
}

export async function searchClients(query: string): Promise<Client[]> {
  return apiRequest<Client[]>(`/clients?search=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
}
