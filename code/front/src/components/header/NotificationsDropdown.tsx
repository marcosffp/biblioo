"use client";

import React from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import { getNotificationText, formatNotificationDate } from "@/utils/notifications";
import type { NotificationSummary } from "@/types/api";
import { useNotificationsPanel } from "@/hooks/useNotificationsPanel";

type NotificationItemProps = {
  notification: NotificationSummary;
  communityNamesById: Record<number, string>;
  processingFollowRequestId: string | null;
  processingCommunityInviteId: string | null;
  processingCommunityJoinRequestId: string | null;
  onNotificationClick: (notification: NotificationSummary) => void;
  onFollowRequestAction: (notification: NotificationSummary, action: "accept" | "reject") => void;
  onJoinRequestAction: (notification: NotificationSummary, action: "approve" | "reject") => void;
};

function NotificationItem({
  notification,
  communityNamesById,
  processingFollowRequestId,
  processingCommunityInviteId,
  processingCommunityJoinRequestId,
  onNotificationClick,
  onFollowRequestAction,
  onJoinRequestAction,
}: Readonly<NotificationItemProps>) {
  const isFollowRequest = notification.type === "USER_FOLLOW_REQUESTED";
  const isProcessingFollowRequest = processingFollowRequestId === notification.id;
  const isCommunityInvite = notification.type === "COMMUNITY_INVITE";
  const isProcessingCommunityInvite = processingCommunityInviteId === notification.id;
  const isCommunityJoinRequest = notification.type === "COMMUNITY_JOIN_REQUEST";
  const hasJoinRequestAction = isCommunityJoinRequest && Boolean(notification.communityId || notification.entityId);
  const isProcessingCommunityJoinRequest = processingCommunityJoinRequestId === notification.id;
  const inviteCommunityName = notification.communityId ? communityNamesById[notification.communityId] : undefined;
  const inviteActorName = notification.actorUsername ?? "Alguem";

  return (
    <li className={notification.read ? "opacity-75" : ""}>
      <button
        type="button"
        onClick={() => void onNotificationClick(notification)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-100 bg-emerald-100">
          {notification.actorAvatarUrl ? (
            <Image
              src={notification.actorAvatarUrl}
              alt={`Avatar de ${notification.actorUsername ?? "usuario"}`}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
              {(notification.actorUsername ?? "U").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {isCommunityInvite ? (
            <div>
              <p className="text-sm text-[var(--deep-green)] break-words leading-5">
                <span className="font-semibold">{inviteActorName}</span> te convidou para a comunidade
              </p>
              <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Comunidade</p>
                <p className="text-sm font-semibold text-[var(--deep-green)] break-words">
                  {inviteCommunityName ?? "Comunidade"}
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {formatNotificationDate(notification.createdAt)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--deep-green)] break-words leading-5">
                {getNotificationText(
                  notification,
                  notification.communityId ? communityNamesById[notification.communityId] : undefined,
                )}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {formatNotificationDate(notification.createdAt)}
              </p>
            </>
          )}
        </div>
      </button>

      {isFollowRequest ? (
        <div className="px-4 pb-3 -mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onFollowRequestAction(notification, "reject")}
            disabled={isProcessingFollowRequest}
            className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => void onFollowRequestAction(notification, "accept")}
            disabled={isProcessingFollowRequest}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aceitar
          </button>
        </div>
      ) : null}

      {isCommunityInvite && isProcessingCommunityInvite ? (
        <p className="px-4 pb-3 text-xs text-[var(--text-secondary)]">Processando convite...</p>
      ) : null}

      {hasJoinRequestAction ? (
        <div className="px-4 pb-3 -mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onJoinRequestAction(notification, "reject")}
            disabled={isProcessingCommunityJoinRequest}
            className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => void onJoinRequestAction(notification, "approve")}
            disabled={isProcessingCommunityJoinRequest}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aceitar
          </button>
        </div>
      ) : null}
    </li>
  );
}

type NotificationsDropdownProps = {
  accessToken: string | null;
  fallbackCount?: number;
};

export function NotificationsDropdown({
  accessToken,
  fallbackCount = 0,
}: Readonly<NotificationsDropdownProps>) {
  const {
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
    handleJoinRequestAction,
  } = useNotificationsPanel(accessToken);

  const shownCount = accessToken ? visibleUnreadCount : fallbackCount;
  const hasAny = shownCount > 0;

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <p className="px-4 py-4 text-sm text-[var(--text-secondary)] break-words">Carregando Notificações...</p>
    );
  } else if (visibleNotifications.length === 0) {
    content = (
      <p className="px-4 py-4 text-sm text-[var(--text-secondary)] break-words">
        Nenhuma notificação por enquanto.
      </p>
    );
  } else {
    content = (
      <ul className="divide-y divide-emerald-50">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            communityNamesById={communityNamesById}
            processingFollowRequestId={processingFollowRequestId}
            processingCommunityInviteId={processingCommunityInviteId}
            processingCommunityJoinRequestId={processingCommunityJoinRequestId}
            onNotificationClick={(n) => void handleNotificationClick(n)}
            onFollowRequestAction={(n, action) => void handleFollowRequestAction(n, action)}
            onJoinRequestAction={(n, action) => void handleJoinRequestAction(n, action)}
          />
        ))}
      </ul>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className="relative h-10 w-10 rounded-full text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30 transition-colors"
        aria-label="Notificações"
        aria-expanded={isNotificationsOpen}
        aria-haspopup="dialog"
      >
        <Bell size={18} className="mx-auto" aria-hidden="true" />
        {hasAny ? (
          <span className="absolute right-1.5 top-1.5 h-4 min-w-4 px-1 rounded-full bg-white text-[#1a8162] text-[10px] font-semibold leading-4 text-center">
            {shownCount}
          </span>
        ) : null}
      </button>

      {isNotificationsOpen ? (
        <div
          aria-label="Notificações"
          className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--deep-green)]">Notificações</h3>
          </div>

          {notificationActionFeedback ? (
            <p
              className={`px-4 py-2 text-xs ${
                notificationActionFeedback.type === "success"
                  ? "border-b border-emerald-100 bg-emerald-50 text-emerald-800"
                  : "border-b border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {notificationActionFeedback.message}
            </p>
          ) : null}

          <div className="max-h-80 overflow-y-auto">{content}</div>
        </div>
      ) : null}
    </div>
  );
}
