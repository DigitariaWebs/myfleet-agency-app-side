import type { ApiResponse } from "@/services/api";

export function toQuery(filters: object): string {
  const entries = Object.entries(filters).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&")
  );
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}
