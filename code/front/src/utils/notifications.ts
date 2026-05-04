import { type NotificationSummary } from "@/services/notifications";

export function normalizeEntityId(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getNotificationText(notification: NotificationSummary, communityName?: string): string {
  const actorName = notification.actorUsername ?? "Alguem";
  const communityLabel = communityName ? ` ${communityName}` : " esta comunidade";

  switch (notification.type) {
    case "USER_FOLLOW_REQUESTED":
      return `${actorName} quer te seguir.`;
    case "USER_FOLLOWED":
      return `${actorName} começou a te seguir.`;
    case "COMMENT_REPLIED":
      return `${actorName} respondeu seu comentário.`;
    case "REVIEW_LIKED":
      return `${actorName} curtiu sua resenha.`;
    case "COMMUNITY_INVITE":
      return `Você recebeu um convite para entrar na comunidade${communityLabel}.`;
    case "COMMUNITY_JOIN_REQUEST":
      return `${actorName} solicitou entrar na comunidade${communityLabel}.`;
    case "COMMUNITY_JOIN_APPROVED":
      return `Sua solicitação para entrar na comunidade${communityLabel} foi aprovada.`;
  }
}

export function getNotificationHref(notification: NotificationSummary): string {
  if (
    (notification.type === "USER_FOLLOW_REQUESTED" || notification.type === "USER_FOLLOWED") &&
    notification.actorUsername
  ) {
    return `/profile/${encodeURIComponent(notification.actorUsername)}`;
  }

  if (notification.type === "COMMENT_REPLIED" && notification.entityId) {
    return `/feed?commentId=${notification.entityId}`;
  }

  if (notification.type === "REVIEW_LIKED" && notification.entityId) {
    return `/feed?reviewId=${notification.entityId}`;
  }

  if (
    notification.type === "COMMUNITY_INVITE" ||
    notification.type === "COMMUNITY_JOIN_REQUEST" ||
    notification.type === "COMMUNITY_JOIN_APPROVED"
  ) {
    if (notification.type === "COMMUNITY_INVITE") {
      const params = new URLSearchParams();
      params.set("openInviteModal", "1");
      if (notification.communityId) params.set("communityId", String(notification.communityId));
      if (notification.entityId) params.set("inviteId", String(notification.entityId));
      params.set("notificationId", notification.id);
      return `/community?${params.toString()}`;
    }

    if (notification.type === "COMMUNITY_JOIN_REQUEST") {
      const params = new URLSearchParams();
      params.set("openJoinRequests", "1");
      if (notification.communityId) params.set("communityId", String(notification.communityId));
      params.set("notificationId", notification.id);
      return `/community?${params.toString()}`;
    }

    if (notification.communityId) return `/community?communityId=${notification.communityId}`;
    return "/community";
  }

  return "/feed";
}

export function formatNotificationDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Agora";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
