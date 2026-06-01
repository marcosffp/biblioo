import { requiredBearerHeaders } from "@/lib/api-headers";
import { normalizeEntityId } from "@/utils/notifications";

import { API_BASE_URL } from "@/lib/api-config";

import type { NotificationType, NotificationSummary } from "@/types/api";

type NotificationApiResponse = {
  id: string;
  type: NotificationType;
  actorId?: number | null;
  actorUsername?: string | null;
  actorAvatarUrl?: string | null;
  entityId?: number | string | null;
  communityId?: number | string | null;
  read: boolean;
  createdAt: string;
};



function mapNotification(item: NotificationApiResponse): NotificationSummary {
  return {
    id: item.id,
    type: item.type,
    actorId: item.actorId ?? null,
    actorUsername: item.actorUsername ?? null,
    actorAvatarUrl: item.actorAvatarUrl ?? null,
    entityId: normalizeEntityId(item.entityId),
    communityId: normalizeEntityId(item.communityId),
    read: item.read,
    createdAt: item.createdAt,
  };
}

export async function listNotifications(page = 0, size = 20, token?: string | null): Promise<NotificationSummary[]> {
  const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&size=${size}`, {
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_notifications_failed");
  }

  const data = (await response.json()) as NotificationApiResponse[];
  return data.map(mapNotification);
}

export async function getUnreadNotificationsCount(token?: string | null): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_unread_count_failed");
  }

  const data = (await response.json()) as { count: number };
  return data.count;
}

export async function markNotificationAsRead(id: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("mark_notification_read_failed");
  }
}

export async function markAllNotificationsAsRead(token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("mark_all_notifications_read_failed");
  }
}
