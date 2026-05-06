import { authedRequest } from "@/services/api";
import type { Client } from "@/types/client";

export async function getClients(): Promise<Client[]> {
  return authedRequest<Client[]>("/clients", { method: "GET" });
}

export async function getClientById(id: string): Promise<Client> {
  return authedRequest<Client>(`/clients/${id}`, { method: "GET" });
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  idType?: string;
  idNumber?: string;
  driverLicense?: string;
  driverLicenseExpiry?: string;
  tags?: string[];
  notes?: string;
  registrationMethod?: string;
}

export async function createClient(data: CreateClientInput): Promise<Client> {
  return authedRequest<Client>("/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
}

// ── Client documents (per-relation, captured by staff at pickup) ───────

export type ClientDocumentType =
  | "id-front"
  | "id-back"
  | "license-front"
  | "license-back"
  | "credit-card-front"
  | "other";

export interface ClientDocument {
  id: string;
  agencyClientId: string;
  type: ClientDocumentType;
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string | null;
}

export async function listClientDocuments(
  clientId: string,
): Promise<ClientDocument[]> {
  return authedRequest<ClientDocument[]>(`/clients/${clientId}/documents`, {
    method: "GET",
  });
}

export async function uploadClientDocument(
  clientId: string,
  type: ClientDocumentType,
  uri: string,
  fileName?: string,
): Promise<ClientDocument> {
  const form = new FormData();
  form.append("file", {
    uri,
    name: fileName ?? `${type}.jpg`,
    type: "image/jpeg",
  } as unknown as Blob);
  form.append("type", type);
  return authedRequest<ClientDocument>(`/clients/${clientId}/documents`, {
    method: "POST",
    body: form,
  });
}

export async function deleteClientDocument(
  documentId: string,
): Promise<{ id: string }> {
  return authedRequest<{ id: string }>(`/clients/documents/${documentId}`, {
    method: "DELETE",
  });
}

export async function updateClient(
  id: string,
  data: UpdateClientInput,
): Promise<Client> {
  return authedRequest<Client>(`/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<{ id: string }> {
  return authedRequest<{ id: string }>(`/clients/${id}`, { method: "DELETE" });
}

export async function searchClients(query: string): Promise<Client[]> {
  return authedRequest<Client[]>(
    `/clients?search=${encodeURIComponent(query)}`,
    { method: "GET" },
  );
}
