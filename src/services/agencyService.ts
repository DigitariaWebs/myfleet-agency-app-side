import { apiRequest } from "@/services/api";
import { getAuthHeader } from "@/services/authHeader";
import type { Agency, AgencyDocument, AgencyDocumentType, AgencySettings, AgencyUser } from "@/types/agency";

export async function getAgency(): Promise<Agency> {
  return apiRequest<Agency>("/agency/me", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function getAgencySettings(): Promise<AgencySettings> {
  return apiRequest<AgencySettings>("/agency/settings", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function getTeam(): Promise<AgencyUser[]> {
  return apiRequest<AgencyUser[]>("/agency/team", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function getAgencyDocuments(): Promise<AgencyDocument[]> {
  return apiRequest<AgencyDocument[]>("/agency/documents", {
    method: "GET",
    headers: await getAuthHeader(),
  });
}

export async function updateAgencyDocument(
  type: AgencyDocumentType,
  file: { uri: string; name: string; mimeType: string },
): Promise<AgencyDocument> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  return apiRequest<AgencyDocument>(`/agency/documents/${type}`, {
    method: "PATCH",
    headers: await getAuthHeader(),
    body: formData,
  });
}

export async function getSignedDocumentUrl(key: string): Promise<string> {
  const result = await apiRequest<{ url: string }>(
    `/storage/signed-url/${encodeURIComponent(key)}`,
    {
      method: "GET",
      headers: await getAuthHeader(),
    },
  );
  return result.url;
}

export interface UpdateAgencyInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  currency?: string;
  timezone?: string;
  logoFile?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
}

export async function updateAgency(data: UpdateAgencyInput): Promise<Agency> {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.phone !== undefined) formData.append("phone", data.phone);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.address !== undefined) formData.append("address", data.address);
  if (data.website !== undefined) formData.append("website", data.website);
  if (data.currency !== undefined) formData.append("currency", data.currency);
  if (data.timezone !== undefined) formData.append("timezone", data.timezone);

  if (data.logoFile) {
    formData.append("logo", {
      uri: data.logoFile.uri,
      name: data.logoFile.name,
      type: data.logoFile.mimeType,
    } as unknown as Blob);
  }

  return apiRequest<Agency>("/agency/me", {
    method: "PATCH",
    headers: await getAuthHeader(),
    body: formData,
  });
}

export interface UpdateAgencySettingsInput {
  defaultLanguage?: 'fr' | 'en';
  invoicePrefix?: string;
  adminFee?: number;
  weekendSurcharge?: number;
  highSeasonMultiplier?: number;
  highSeasonMonths?: number[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  autoReminders?: boolean;
  deliveryEnabled?: boolean;
  deliveryBasePointLabel?: string;
  deliveryBasePointAddress?: string;
  deliveryBasePointLat?: number;
  deliveryBasePointLng?: number;
  deliveryRatePerKm?: number;
  deliveryCurrency?: string;
  deliveryMinFee?: number;
  deliveryMaxDistanceKm?: number;
  bookingAutoCancelUnpaid?: boolean;
  bookingAutoCancelAfterHours?: number;
}

export async function updateAgencySettings(
  data: UpdateAgencySettingsInput,
): Promise<AgencySettings> {
  return apiRequest<AgencySettings>("/agency/settings", {
    method: "PATCH",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
