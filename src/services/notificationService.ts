import { authedRequest } from "@/services/api";
import type { AppNotification } from "@/types/notification";

export async function getNotifications(): Promise<AppNotification[]> {
  return authedRequest<AppNotification[]>(`/notifications`, { method: "GET" });
}

export async function getUnreadCount(): Promise<number> {
  const res = await authedRequest<{ count: number }>(
    `/notifications/unread-count`,
    { method: "GET" },
  );
  return res.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await authedRequest<{ ok: true }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await authedRequest<{ ok: true }>(`/notifications/read-all`, {
    method: "PATCH",
  });
}
