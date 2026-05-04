import React from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useDropdownClose } from "@/hooks/useDropdownClose";
import { getNotificationHref } from "@/utils/notifications";
import {
  acceptCommunityInvite,
  approveCommunityJoinRequest,
  CommunityApiError,
  declineCommunityInvite,
  listCommunities,
  listPendingCommunityInvites,
  listPendingCommunityJoinRequests,
  rejectCommunityJoinRequest,
} from "@/services/community";
import { type NotificationSummary } from "@/services/notifications";
import {
  acceptFollowRequest,
  listPendingFollowRequests,
  rejectFollowRequest,
} from "@/services/profile";

type NotificationActionFeedback = {
  type: "success" | "error";
  message: string;
};

export function useNotificationsPanel(accessToken: string | null) {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [processingFollowRequestId, setProcessingFollowRequestId] = React.useState<string | null>(null);
  const [processingCommunityInviteId, setProcessingCommunityInviteId] = React.useState<string | null>(null);
  const [processingCommunityJoinRequestId, setProcessingCommunityJoinRequestId] = React.useState<string | null>(null);
  const [pendingFollowRequestUsernames, setPendingFollowRequestUsernames] = React.useState<Record<string, true> | null>(null);
  const [resolvedFollowRequestIds, setResolvedFollowRequestIds] = React.useState<Record<string, true>>({});
  const [resolvedCommunityNotificationIds, setResolvedCommunityNotificationIds] = React.useState<Record<string, true>>({});
  const [communityNamesById, setCommunityNamesById] = React.useState<Record<number, string>>({});
  const [notificationActionFeedback, setNotificationActionFeedback] = React.useState<NotificationActionFeedback | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { notifications, isLoading, markAsRead, dismissNotification, refresh } = useNotifications(accessToken);

  const closePanel = React.useCallback(() => setIsNotificationsOpen(false), []);
  useDropdownClose(containerRef, isNotificationsOpen, closePanel);

  const latestFollowedByActor = React.useMemo(() => {
    const result: Record<string, string> = {};
    notifications.forEach((notification) => {
      if (notification.type !== "USER_FOLLOWED" || !notification.actorUsername) return;
      const actorKey = notification.actorUsername.toLowerCase();
      const previous = result[actorKey];
      if (!previous || new Date(notification.createdAt).getTime() >= new Date(previous).getTime()) {
        result[actorKey] = notification.createdAt;
      }
    });
    return result;
  }, [notifications]);

  const loadPendingFollowRequestUsernames = React.useCallback(async () => {
    if (!accessToken) {
      setPendingFollowRequestUsernames(null);
      return;
    }
    try {
      const page = await listPendingFollowRequests(0, 100, accessToken);
      const nextState: Record<string, true> = {};
      page.users.forEach((user) => {
        nextState[user.username.toLowerCase()] = true;
      });
      setPendingFollowRequestUsernames(nextState);
    } catch {
      setPendingFollowRequestUsernames(null);
    }
  }, [accessToken]);

  const visibleNotifications = React.useMemo(() => {
    return notifications.filter((notification) => {
      if (notification.read) return false;
      if (resolvedCommunityNotificationIds[notification.id]) return false;
      if (notification.type !== "USER_FOLLOW_REQUESTED") return true;
      if (resolvedFollowRequestIds[notification.id]) return false;
      if (!notification.actorUsername) return false;

      const actorKey = notification.actorUsername.toLowerCase();
      const latestFollowedAt = latestFollowedByActor[actorKey];
      if (latestFollowedAt) {
        const requestAt = new Date(notification.createdAt).getTime();
        const followedAt = new Date(latestFollowedAt).getTime();
        if (Number.isFinite(requestAt) && Number.isFinite(followedAt) && followedAt >= requestAt) return false;
      }

      if (pendingFollowRequestUsernames === null) return true;
      return Boolean(pendingFollowRequestUsernames[actorKey]);
    });
  }, [
    latestFollowedByActor,
    notifications,
    pendingFollowRequestUsernames,
    resolvedCommunityNotificationIds,
    resolvedFollowRequestIds,
  ]);

  const visibleUnreadCount = React.useMemo(() => {
    return visibleNotifications.reduce((total, n) => (n.read ? total : total + 1), 0);
  }, [visibleNotifications]);

  React.useEffect(() => {
    if (!isNotificationsOpen) return;
    void loadPendingFollowRequestUsernames();
  }, [isNotificationsOpen, loadPendingFollowRequestUsernames]);

  React.useEffect(() => {
    if (!isNotificationsOpen || !accessToken) return;

    const communityTypes = ["COMMUNITY_INVITE", "COMMUNITY_JOIN_REQUEST", "COMMUNITY_JOIN_APPROVED"] as const;
    const targetCommunityIds = visibleNotifications
      .filter((n) => communityTypes.includes(n.type as (typeof communityTypes)[number]) && Boolean(n.communityId))
      .map((n) => n.communityId)
      .filter((id): id is number => Boolean(id));

    const missingIds = Array.from(new Set(targetCommunityIds)).filter((id) => !communityNamesById[id]);
    if (missingIds.length === 0) return;

    let cancelled = false;
    void (async () => {
      try {
        const [mine, discover, pendingInvites] = await Promise.all([
          listCommunities({ mine: true, page: 0, size: 100, token: accessToken }),
          listCommunities({ mine: false, page: 0, size: 100, token: accessToken }),
          listPendingCommunityInvites(0, 100, accessToken),
        ]);
        if (cancelled) return;

        const mergedNames: Record<number, string> = {};
        [...mine, ...discover].forEach((c) => {
          mergedNames[c.id] = c.name;
        });
        pendingInvites.forEach((invite) => {
          if (!mergedNames[invite.communityId]) mergedNames[invite.communityId] = invite.communityName;
        });
        setCommunityNamesById((current) => ({ ...current, ...mergedNames }));
      } catch {
        // Keep notifications usable even if community name loading fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, communityNamesById, isNotificationsOpen, visibleNotifications]);

  const handleBellClick = React.useCallback(() => {
    setNotificationActionFeedback(null);
    setIsNotificationsOpen((prev) => !prev);
  }, []);

  const handleNotificationClick = React.useCallback(
    async (notification: NotificationSummary) => {
      if (notification.type !== "COMMUNITY_INVITE") {
        try {
          await markAsRead(notification.id);
        } catch {
          // Keep navigation even if mark-as-read fails.
        }
      }
      setIsNotificationsOpen(false);
      router.push(getNotificationHref(notification));
    },
    [markAsRead, router],
  );

  const handleFollowRequestAction = React.useCallback(
    async (notification: NotificationSummary, action: "accept" | "reject") => {
      if (!accessToken || processingFollowRequestId || !notification.actorUsername) return;

      setProcessingFollowRequestId(notification.id);
      setResolvedFollowRequestIds((current) => ({ ...current, [notification.id]: true }));
      setPendingFollowRequestUsernames((current) => {
        if (current === null || !notification.actorUsername) return current;
        const nextState = { ...current };
        delete nextState[notification.actorUsername.toLowerCase()];
        return nextState;
      });

      try {
        if (action === "accept") {
          await acceptFollowRequest(notification.actorUsername, accessToken);
          dismissNotification(notification.id);
          await Promise.all([refresh(), loadPendingFollowRequestUsernames()]);
        } else {
          await rejectFollowRequest(notification.actorUsername, accessToken);
          dismissNotification(notification.id);
          await loadPendingFollowRequestUsernames();
        }
      } catch {
        // Keep dropdown usable even if request fails.
        setResolvedFollowRequestIds((current) => {
          const nextState = { ...current };
          delete nextState[notification.id];
          return nextState;
        });
      } finally {
        setProcessingFollowRequestId(null);
      }
    },
    [accessToken, dismissNotification, loadPendingFollowRequestUsernames, processingFollowRequestId, refresh],
  );

  const resolveCommunityInviteCandidates = React.useCallback(
    async (notification: NotificationSummary): Promise<number[]> => {
      if (!accessToken || notification.type !== "COMMUNITY_INVITE") return [];
      try {
        const pendingInvites = await listPendingCommunityInvites(0, 100, accessToken);
        const candidates: number[] = [];

        pendingInvites
          .filter((invite) => {
            const sameCommunity = notification.communityId ? invite.communityId === notification.communityId : true;
            const sameActor = notification.actorId ? invite.inviterId === notification.actorId : true;
            return sameCommunity && sameActor;
          })
          .forEach((invite) => candidates.push(invite.id));

        if (notification.communityId) {
          pendingInvites
            .filter((invite) => invite.communityId === notification.communityId)
            .forEach((invite) => candidates.push(invite.id));
        }
        if (notification.actorId) {
          pendingInvites
            .filter((invite) => invite.inviterId === notification.actorId)
            .forEach((invite) => candidates.push(invite.id));
        }
        if (notification.entityId) candidates.push(notification.entityId);

        return candidates.filter((id, index) => candidates.indexOf(id) === index);
      } catch {
        return notification.entityId ? [notification.entityId] : [];
      }
    },
    [accessToken],
  );

  const processCommunityInviteCandidates = React.useCallback(
    async (inviteCandidates: number[], action: "accept" | "decline", token: string): Promise<boolean> => {
      for (const inviteCandidate of inviteCandidates) {
        try {
          if (action === "accept") {
            await acceptCommunityInvite(inviteCandidate, token);
          } else {
            await declineCommunityInvite(inviteCandidate, token);
          }
          return true;
        } catch (error) {
          if (!(error instanceof CommunityApiError && error.status === 400)) throw error;
        }
      }
      return false;
    },
    [],
  );

  const finalizeCommunityInviteNotification = React.useCallback(
    async (notification: NotificationSummary, action: "accept" | "decline") => {
      try {
        await markAsRead(notification.id);
      } catch {
        // Keep workflow resilient even if mark-as-read fails.
      }
      dismissNotification(notification.id);
      setResolvedCommunityNotificationIds((current) => ({ ...current, [notification.id]: true }));
      await refresh();

      if (action === "accept") {
        setNotificationActionFeedback({ type: "success", message: "Convite aceito com sucesso." });
        setIsNotificationsOpen(false);
        router.push(
          notification.communityId
            ? `/community?communityId=${notification.communityId}&open=1`
            : "/community",
        );
      } else {
        setNotificationActionFeedback({ type: "success", message: "Convite recusado." });
      }
    },
    [dismissNotification, markAsRead, refresh, router],
  );

  const handleCommunityInviteAction = React.useCallback(
    async (notification: NotificationSummary, action: "accept" | "decline") => {
      if (!accessToken || processingCommunityInviteId || notification.type !== "COMMUNITY_INVITE") return;
      if (!notification.entityId && !notification.communityId) return;

      setProcessingCommunityInviteId(notification.id);
      try {
        const inviteCandidates = await resolveCommunityInviteCandidates(notification);
        if (inviteCandidates.length === 0) {
          setNotificationActionFeedback({
            type: "error",
            message: "Não foi possível localizar o convite pendente para esta notificacao.",
          });
          return;
        }

        const processed = await processCommunityInviteCandidates(inviteCandidates, action, accessToken);
        if (!processed) {
          setNotificationActionFeedback({
            type: "error",
            message: "Não foi possível processar o convite. Tente novamente.",
          });
          return;
        }

        await finalizeCommunityInviteNotification(notification, action);
      } catch (error) {
        const message =
          error instanceof CommunityApiError && error.message
            ? error.message
            : "Não foi possível processar o convite agora.";
        setNotificationActionFeedback({ type: "error", message });
      } finally {
        setProcessingCommunityInviteId(null);
      }
    },
    [
      accessToken,
      finalizeCommunityInviteNotification,
      processCommunityInviteCandidates,
      processingCommunityInviteId,
      resolveCommunityInviteCandidates,
    ],
  );

  const resolveCommunityJoinRequestId = React.useCallback(
    async (notification: NotificationSummary): Promise<number | null> => {
      if (!accessToken || notification.type !== "COMMUNITY_JOIN_REQUEST") return null;
      const communityId = notification.communityId ?? notification.entityId;
      if (!communityId) return null;
      try {
        const pendingRequests = await listPendingCommunityJoinRequests(communityId, 0, 100, accessToken);
        const byActor = notification.actorId
          ? pendingRequests.find((request) => request.userId === notification.actorId)
          : null;
        if (byActor) return byActor.id;
        return pendingRequests[0]?.id ?? null;
      } catch {
        return null;
      }
    },
    [accessToken],
  );

  const handleJoinRequestAction = React.useCallback(
    async (notification: NotificationSummary, action: "approve" | "reject") => {
      if (!accessToken || processingCommunityJoinRequestId || notification.type !== "COMMUNITY_JOIN_REQUEST") return;

      setProcessingCommunityJoinRequestId(notification.id);
      try {
        const requestId = await resolveCommunityJoinRequestId(notification);
        if (!requestId) {
          setNotificationActionFeedback({
            type: "error",
            message: "Não foi possível localizar a solicitacao pendente.",
          });
          return;
        }

        if (action === "approve") {
          await approveCommunityJoinRequest(requestId, accessToken);
        } else {
          await rejectCommunityJoinRequest(requestId, accessToken);
        }

        try {
          await markAsRead(notification.id);
        } catch {
          // Keep workflow resilient even if mark-as-read fails.
        }
        dismissNotification(notification.id);
        setResolvedCommunityNotificationIds((current) => ({ ...current, [notification.id]: true }));
        await refresh();
        setNotificationActionFeedback({
          type: "success",
          message: action === "approve" ? "Solicitacao aprovada com sucesso." : "Solicitacao recusada.",
        });
      } catch (error) {
        const message =
          error instanceof CommunityApiError && error.message
            ? error.message
            : "Não foi possível processar a solicitacao agora.";
        setNotificationActionFeedback({ type: "error", message });
      } finally {
        setProcessingCommunityJoinRequestId(null);
      }
    },
    [
      accessToken,
      dismissNotification,
      markAsRead,
      processingCommunityJoinRequestId,
      refresh,
      resolveCommunityJoinRequestId,
    ],
  );

  return {
    containerRef,
    isNotificationsOpen,
    visibleNotifications,
    visibleUnreadCount,
    isLoading,
    communityNamesById,
    processingFollowRequestId,
    processingCommunityInviteId,
    processingCommunityJoinRequestId,
    notificationActionFeedback,
    handleBellClick,
    handleNotificationClick,
    handleFollowRequestAction,
    handleCommunityInviteAction,
    handleJoinRequestAction,
  };
}
