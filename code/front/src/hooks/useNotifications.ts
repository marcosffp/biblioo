import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications";
import type { NotificationSummary, NotificationType } from "@/types/api";
import { normalizeEntityId } from "@/utils/notifications";

import { API_BASE_URL } from "@/lib/api-config";
const SSE_EVENT_NAME = "notification";

type RealtimeNotificationPayload = {
  id: string;
  type: NotificationType;
  actorId?: number | null;
  actorUsername?: string | null;
  actorAvatarUrl?: string | null;
  entityId?: number | string | null;
  communityId?: number | string | null;
  createdAt: string;
};


function fromRealtimePayload(payload: RealtimeNotificationPayload): NotificationSummary {
  return {
    id: payload.id,
    type: payload.type,
    actorId: payload.actorId ?? null,
    actorUsername: payload.actorUsername ?? null,
    actorAvatarUrl: payload.actorAvatarUrl ?? null,
    entityId: normalizeEntityId(payload.entityId),
    communityId: normalizeEntityId(payload.communityId),
    read: false,
    createdAt: payload.createdAt,
  };
}

function parseRealtimeNotification(data: string): NotificationSummary | null {
  try {
    const payload = JSON.parse(data) as RealtimeNotificationPayload;
    return fromRealtimePayload(payload);
  } catch {
    return null;
  }
}

function prependUniqueNotification(
  previous: NotificationSummary[],
  incoming: NotificationSummary,
): NotificationSummary[] {
  if (previous.some((item) => item.id === incoming.id)) {
    return previous;
  }

  return [incoming, ...previous];
}

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [notificationList, unread] = await Promise.all([
        listNotifications(0, 20, token),
        getUnreadNotificationsCount(token),
      ]);

      setNotifications(notificationList);
      setUnreadCount(unread);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const loadInitialData = async () => {
      await refresh();
    };

    void loadInitialData();
  }, [refresh, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    void fetchEventSource(`${API_BASE_URL}/notifications/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      async onopen(response) {
        if (!response.ok) {
          throw new Error("sse_connection_failed");
        }
      },
      onmessage(message) {
        if (message.event && message.event !== SSE_EVENT_NAME) {
          return;
        }

        if (!message.data) {
          return;
        }

        const incoming = parseRealtimeNotification(message.data);
        if (!incoming) {
          return;
        }

        setNotifications((previous) => prependUniqueNotification(previous, incoming));
        setUnreadCount((previous) => previous + 1);
      },
      onerror() {
        // Keep default auto-reconnect behavior from fetch-event-source.
      },
      openWhenHidden: true,
    });

    return () => {
      controller.abort();
    };
  }, [token]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!token) {
        return;
      }

      const target = notifications.find((item) => item.id === id);
      if (!target || target.read) {
        return;
      }

      await markNotificationAsRead(id, token);

      setNotifications((previous) =>
        previous.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      setUnreadCount((previous) => Math.max(0, previous - 1));
    },
    [notifications, token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) {
      return;
    }

    await markAllNotificationsAsRead(token);
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }, [token]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((previous) => {
      const target = previous.find((item) => item.id === id);
      if (!target) {
        return previous;
      }

      if (!target.read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      return previous.filter((item) => item.id !== id);
    });
  }, []);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      refresh,
    }),
    [dismissNotification, isLoading, markAllAsRead, markAsRead, notifications, refresh, unreadCount],
  );
}
