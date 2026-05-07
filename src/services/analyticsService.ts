import { authedRequest } from "@/services/api";

export type AnalyticsPeriod = "today" | "week" | "month" | "quarter";

export interface AnalyticsSummary {
  revenueCents: number;
  trendPct: number;
  fleetUtilization: {
    activePct: number;
    active: number;
    available: number;
    maintenance: number;
    inactive: number;
    total: number;
  };
  bookings: {
    total: number;
    avgDurationDays: number;
    avgRateCents: number;
    cancellationPct: number;
  };
  violations: {
    total: number;
    finesCents: number;
    recoveryPct: number;
  };
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalSpentCents: number;
}

export async function getAnalyticsSummary(
  period: AnalyticsPeriod = "month",
): Promise<AnalyticsSummary> {
  return authedRequest<AnalyticsSummary>(
    `/analytics/summary?period=${period}`,
    {
      method: "GET",
    },
  );
}

export async function getTopClients(
  period: AnalyticsPeriod = "month",
  limit = 5,
): Promise<TopClient[]> {
  return authedRequest<TopClient[]>(
    `/analytics/top-clients?period=${period}&limit=${limit}`,
    { method: "GET" },
  );
}
