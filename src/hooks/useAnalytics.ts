import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsSummary,
  getTopClients,
  type AnalyticsPeriod,
} from "@/services/analyticsService";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (period: AnalyticsPeriod) =>
    [...analyticsKeys.all, "summary", period] as const,
  topClients: (period: AnalyticsPeriod, limit: number) =>
    [...analyticsKeys.all, "top-clients", period, limit] as const,
};

export function useAnalyticsSummary(period: AnalyticsPeriod = "month") {
  return useQuery({
    queryKey: analyticsKeys.summary(period),
    queryFn: () => getAnalyticsSummary(period),
  });
}

export function useTopClients(period: AnalyticsPeriod = "month", limit = 5) {
  return useQuery({
    queryKey: analyticsKeys.topClients(period, limit),
    queryFn: () => getTopClients(period, limit),
  });
}
