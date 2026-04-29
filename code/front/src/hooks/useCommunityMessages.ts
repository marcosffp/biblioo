import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/services/auth";
import {
  getCommunityMembers,
  getCommunityRecentMessages,
  getCommunityWebSocketEndpoint,
  syncCommunityMessagesAfter,
  uploadCommunityMessageMedia,
  type BackendCommunityMember,
  type BackendCommunityMessage,
  type BackendMessageEventPayload,
} from "@/services/community-messages";
import type { CommunityChatMessage, CommunityMember } from "@/hooks/useCommunity";

interface SendMessageInput {
  content: string;
  hasSpoiler: boolean;
  images?: File[];
  gif?: File | null;
}

interface EditMessageInput {
  messageId: string;
  content: string;
}

interface TypingEntry {
  avatarUrl: string | null;
  timestamp: number;
}

export interface TypingUser {
  userId: number;
  username: string;
  avatarUrl: string | null;
}

function decodeCurrentUserId(): string | null {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = JSON.parse(atob(paddedBase64)) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

function parseMessageEvent(payload: string): BackendMessageEventPayload | null {
  try {
    return JSON.parse(payload) as BackendMessageEventPayload;
  } catch {
    return null;
  }
}

function formatMessageTime(value?: string | null): string {
  if (!value) {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function mapMember(item: BackendCommunityMember): CommunityMember {
  const username = item.username?.trim() ? item.username.trim() : `membro-${item.userId}`;

  return {
    id: String(item.userId),
    name: username,
    username,
    avatarUrl: item.avatarUrl ?? null,
    isAdmin: item.role === "OWNER" || item.role === "MODERATOR",
  };
}

function mapBackendMessageToUi(
  item: BackendCommunityMessage,
  params: {
    currentUserId: string | null;
    memberNameById: Map<string, string>;
  },
): CommunityChatMessage {
  const authorId = item.authorId == null ? "system" : String(item.authorId);
  const isMine = params.currentUserId != null && authorId === params.currentUserId;
  const mappedUserName = params.memberNameById.get(authorId);

  return {
    id: String(item.id ?? item.clientMessageId ?? `${Date.now()}`),
    userId: authorId,
    userName: isMine ? "Voce" : mappedUserName ?? "Membro",
    text: item.deleted ? "Mensagem removida" : item.content ?? "",
    time: formatMessageTime(item.createdAt),
    isMine,
    isSpoiler: item.hasSpoiler,
    heartCount: item.heartCount ?? 0,
    images: item.images ?? [],
    gifUrl: item.gifUrl ?? null,
    isDeleted: item.deleted,
    isEdited: Boolean(item.editedAt),
  };
}

function asNumericMessageId(messageId: string): number {
  const parsed = Number(messageId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("A mensagem ainda não pode ser atualizada.");
  }

  return parsed;
}

function mergeMessage(current: CommunityChatMessage, next: CommunityChatMessage): CommunityChatMessage {
  const shouldPreserveOwnership = next.isDeleted;

  return {
    ...current,
    ...next,
    userId: shouldPreserveOwnership ? current.userId : next.userId,
    userName: shouldPreserveOwnership ? current.userName : next.userName,
    isMine: shouldPreserveOwnership ? current.isMine : next.isMine,
    hasHeartReaction: next.hasHeartReaction ?? current.hasHeartReaction,
  };
}

function sortMessages(messages: CommunityChatMessage[]): CommunityChatMessage[] {
  return [...messages]
    .map((message, index) => {
      const numericId = Number(message.id);
      return {
        message,
        index,
        sortableId: Number.isFinite(numericId) ? numericId : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => {
      if (a.sortableId === b.sortableId) {
        return a.index - b.index;
      }

      return a.sortableId - b.sortableId;
    })
    .map((item) => item.message);
}

const CLIENT_TYPING_THROTTLE_MS = 800;

export function useCommunityMessages(communityId: string) {
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const clientRef = useRef<Client | null>(null);
  const isCancelledRef = useRef(false);
  const currentUserId = useMemo(() => decodeCurrentUserId(), []);
  const pendingByClientMessageIdRef = useRef<Map<string, string>>(new Map());
  const memberNameByIdRef = useRef<Map<string, string>>(new Map());
  const messagesRef = useRef<CommunityChatMessage[]>([]);
  const reactionLockByMessageIdRef = useRef<Set<string>>(new Set());
  const typingMapRef = useRef<Map<number, TypingEntry>>(new Map());
  const lastTypingSentRef = useRef(0);

  const communityIdNumber = useMemo(() => Number(communityId), [communityId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const refreshTypingUsers = useCallback(() => {
    const now = Date.now();
    const active: TypingUser[] = [];
    typingMapRef.current.forEach((entry, userId) => {
      if (now - entry.timestamp <= 2000) {
        active.push({
          userId,
          username: memberNameByIdRef.current.get(String(userId)) ?? "Membro",
          avatarUrl: entry.avatarUrl,
        });
      }
    });
    setTypingUsers(active);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      typingMapRef.current.forEach((entry, userId) => {
        if (now - entry.timestamp > 2000) {
          typingMapRef.current.delete(userId);
          changed = true;
        }
      });
      if (changed) refreshTypingUsers();
    }, 500);
    return () => clearInterval(interval);
  }, [refreshTypingUsers]);

  const replaceOrAppendMessage = useCallback((nextMessage: CommunityChatMessage, clientMessageId?: string | null) => {
    setMessages((current) => {
      const replacedById = current.map((item) =>
        item.id === nextMessage.id ? mergeMessage(item, nextMessage) : item,
      );

      if (replacedById.some((item) => item.id === nextMessage.id)) {
        return sortMessages(replacedById);
      }

      if (clientMessageId) {
        const optimisticId = pendingByClientMessageIdRef.current.get(clientMessageId);
        if (optimisticId) {
          pendingByClientMessageIdRef.current.delete(clientMessageId);
          const replacedOptimistic = replacedById.map((item) =>
            item.id === optimisticId ? mergeMessage(item, nextMessage) : item,
          );
          return sortMessages(replacedOptimistic);
        }
      }

      return sortMessages([...replacedById, nextMessage]);
    });
  }, []);

  const handleRealtimeEvent = useCallback(
    (payload: string) => {
      const event = parseMessageEvent(payload);
      if (!event) {
        return;
      }

      if (event.eventType === "ERROR") {
        setMessageError(event.data.content || "Erro no envio de mensagem.");
        return;
      }

      if (event.eventType === "REACTION_UPDATED") {
        const targetId = String(event.data.id ?? "");
        if (!targetId) {
          return;
        }

        reactionLockByMessageIdRef.current.delete(targetId);

        setMessages((current) =>
          current.map((item) =>
            item.id === targetId
              ? {
                  ...item,
                  heartCount: event.data.heartCount ?? item.heartCount ?? 0,
                }
              : item,
          ),
        );
        return;
      }

      if (event.eventType === "MESSAGE_DELETED") {
        const targetId = String(event.data.id ?? "");
        if (!targetId) {
          return;
        }

        setMessages((current) =>
          current.map((item) =>
            item.id === targetId
              ? {
                  ...item,
                  text: "Mensagem removida",
                  isDeleted: true,
                  images: [],
                  gifUrl: null,
                }
              : item,
          ),
        );
        return;
      }

      const mapped = mapBackendMessageToUi(event.data, {
        currentUserId,
        memberNameById: memberNameByIdRef.current,
      });

      if (!mapped.isMine && !memberNameByIdRef.current.has(mapped.userId)) {
        mapped.userName = "Membro";
      }

      replaceOrAppendMessage(mapped, event.data.clientMessageId);
    },
    [currentUserId, replaceOrAppendMessage],
  );

  const onCreatedFrame = useCallback(
    (frame: IMessage) => {
      handleRealtimeEvent(frame.body);
    },
    [handleRealtimeEvent],
  );

  const onErrorFrame = useCallback((frame: IMessage) => {
    handleRealtimeEvent(frame.body);
  }, [handleRealtimeEvent]);

  const onTypingFrame = useCallback(
    (frame: IMessage) => {
      try {
        const payload = JSON.parse(frame.body) as { userId: number; avatarUrl: string | null };
        if (currentUserId != null && String(payload.userId) === currentUserId) return;
        typingMapRef.current.set(payload.userId, { avatarUrl: payload.avatarUrl, timestamp: Date.now() });
        refreshTypingUsers();
      } catch {
        // ignore malformed frame
      }
    },
    [currentUserId, refreshTypingUsers],
  );

  const refreshMembers = useCallback(async () => {
    if (!Number.isFinite(communityIdNumber)) return;
    try {
      const loadedMembers = await getCommunityMembers(communityIdNumber);
      const mappedMembers = loadedMembers.map(mapMember);
      setMembers(mappedMembers);
      const memberNameById = new Map<string, string>();
      mappedMembers.forEach((member) => {
        memberNameById.set(member.id, member.name);
      });
      memberNameByIdRef.current = memberNameById;
    } catch {
      // silently ignore refresh errors
    }
  }, [communityIdNumber]);

  const syncLostMessages = useCallback(async () => {
    if (!Number.isFinite(communityIdNumber)) {
      return;
    }

    const latestId = messagesRef.current
      .map((item) => Number(item.id))
      .filter((id) => Number.isFinite(id))
      .reduce((max, id) => Math.max(max, id), 0);

    if (!latestId) {
      return;
    }

    const synced = await syncCommunityMessagesAfter(communityIdNumber, latestId);
    synced.forEach((item) => {
      const mapped = mapBackendMessageToUi(item, {
        currentUserId,
        memberNameById: memberNameByIdRef.current,
      });
      replaceOrAppendMessage(mapped, item.clientMessageId);
    });
  }, [communityIdNumber, currentUserId, replaceOrAppendMessage]);

  const subscribeRealtimeTopics = useCallback(
    (client: Client, communityNumericId: number) => {
      client.subscribe(`/topic/community.${communityNumericId}`, onCreatedFrame);
      client.subscribe(`/topic/community.${communityNumericId}.edits`, onCreatedFrame);
      client.subscribe(`/topic/community.${communityNumericId}.reactions`, onCreatedFrame);
      client.subscribe(`/topic/community.${communityNumericId}.typing`, onTypingFrame);
      client.subscribe(`/user/queue/errors`, onErrorFrame);
    },
    [onCreatedFrame, onErrorFrame, onTypingFrame],
  );

  useEffect(() => {
    if (!Number.isFinite(communityIdNumber)) {
      setMessages([]);
      setMembers([]);
      setTypingUsers([]);
      setIsLoadingMessages(false);
      setIsConnected(false);
      setMessageError("Comunidade inválida.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setMessages([]);
      setMembers([]);
      setTypingUsers([]);
      setIsLoadingMessages(false);
      setIsConnected(false);
      setMessageError("Você precisa estar autenticado para acessar o chat.");
      return;
    }

    isCancelledRef.current = false;
    setIsLoadingMessages(true);
    setMessageError("");
    setTypingUsers([]);
    typingMapRef.current.clear();

    const bootstrap = async () => {
      try {
        const [loadedMembers, loadedMessages] = await Promise.all([
          getCommunityMembers(communityIdNumber),
          getCommunityRecentMessages(communityIdNumber),
        ]);

        if (isCancelledRef.current) {
          return;
        }

        const mappedMembers = loadedMembers.map(mapMember);
        setMembers(mappedMembers);

        const memberNameById = new Map<string, string>();
        mappedMembers.forEach((member) => {
          memberNameById.set(member.id, member.name);
        });
        memberNameByIdRef.current = memberNameById;

        const sortedMessages = [...loadedMessages].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        const mappedMessages = sortedMessages.map((item) =>
          mapBackendMessageToUi(item, {
            currentUserId,
            memberNameById: memberNameByIdRef.current,
          }),
        );

        setMessages(mappedMessages);

        const client = new Client({
          webSocketFactory: () => new SockJS(getCommunityWebSocketEndpoint()),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          debug: () => {
            // Silence debug logs in production use.
          },
          onConnect: () => {
            if (isCancelledRef.current) {
              return;
            }

            setIsConnected(true);
            setMessageError("");
            subscribeRealtimeTopics(client, communityIdNumber);
            void syncLostMessages();
          },
          onStompError: (frame) => {
            if (isCancelledRef.current) {
              return;
            }

            setMessageError(frame.headers.message || "Erro de conexão em tempo real.");
            setIsConnected(false);
          },
          onWebSocketClose: () => {
            if (isCancelledRef.current) {
              return;
            }

            setIsConnected(false);
          },
        });

        clientRef.current = client;
        client.activate();
      } catch (error) {
        if (isCancelledRef.current) {
          return;
        }

        const message = error instanceof Error ? error.message : "Falha ao carregar mensagens.";
        setMessageError(message);
        setMessages([]);
        setMembers([]);
      } finally {
        if (isCancelledRef.current) {
          return;
        }

        setIsLoadingMessages(false);
      }
    };

    void bootstrap();

    return () => {
      isCancelledRef.current = true;
      typingMapRef.current.clear();
      setTypingUsers([]);
      const currentClient = clientRef.current;
      clientRef.current = null;
      if (currentClient?.active) {
        currentClient.deactivate();
      }
    };
  }, [communityIdNumber, currentUserId, subscribeRealtimeTopics, syncLostMessages]);

  const sendMessage = useCallback(
    async ({ content, hasSpoiler, images, gif }: SendMessageInput) => {
      const client = clientRef.current;
      if (!client?.connected) {
        throw new Error("Conexão em tempo real indisponível. Tente novamente em alguns instantes.");
      }

      const hasMedia = Boolean((images && images.length > 0) || gif);
      const normalizedContent = content.trim();
      if (!normalizedContent && !hasMedia) {
        return;
      }

      setIsSendingMessage(true);

      const clientMessageId = crypto.randomUUID();
      const optimisticId = `temp-${clientMessageId}`;
      pendingByClientMessageIdRef.current.set(clientMessageId, optimisticId);

      try {
        let uploadedImages: string[] = [];
        let uploadedGifUrl: string | null = null;

        if (hasMedia) {
          const uploaded = await uploadCommunityMessageMedia(communityIdNumber, {
            images,
            gif,
          });
          uploadedImages = uploaded.images ?? [];
          uploadedGifUrl = uploaded.gifUrl ?? null;
        }

        if (!hasMedia) {
          const optimisticMessage: CommunityChatMessage = {
            id: optimisticId,
            userId: currentUserId ?? "me",
            userName: "Voce",
            text: normalizedContent || "Mídia anexada",
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            isMine: true,
            isSpoiler: hasSpoiler,
            heartCount: 0,
            images: uploadedImages,
            gifUrl: uploadedGifUrl,
            isDeleted: false,
          };

          setMessages((current) => [...current, optimisticMessage]);
        }

        client.publish({
          destination: `/app/community/${communityIdNumber}/send`,
          body: JSON.stringify({
            content: normalizedContent,
            parentMessageId: null,
            tags: [],
            images: uploadedImages,
            gifUrl: uploadedGifUrl,
            hasSpoiler,
            clientMessageId,
          }),
        });
      } catch (error) {
        pendingByClientMessageIdRef.current.delete(clientMessageId);
        setMessages((current) => current.filter((item) => item.id !== optimisticId));
        if (error instanceof Error && error.message) {
          setMessageError(error.message);
          throw error;
        }

        throw new Error("Nao foi possivel enviar a mensagem.");
      } finally {
        setIsSendingMessage(false);
      }
    },
    [communityIdNumber, currentUserId],
  );

  const editMessage = useCallback(
    async ({ messageId, content }: EditMessageInput) => {
      const client = clientRef.current;
      if (!client?.connected) {
        throw new Error("Conexão em tempo real indisponível. Tente novamente em alguns instantes.");
      }

      const normalized = content.trim();
      if (!normalized) {
        throw new Error("A mensagem editada não pode ficar vazia.");
      }

      const numericMessageId = asNumericMessageId(messageId);

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                text: normalized,
                isEdited: true,
              }
            : item,
        ),
      );

      client.publish({
        destination: `/app/community/${communityIdNumber}/messages/${numericMessageId}/edit`,
        body: JSON.stringify({ content: normalized }),
      });
    },
    [communityIdNumber],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const client = clientRef.current;
      if (!client?.connected) {
        throw new Error("Conexão em tempo real indisponível. Tente novamente em alguns instantes.");
      }

      const numericMessageId = asNumericMessageId(messageId);

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                text: "Mensagem removida",
                isDeleted: true,
                images: [],
                gifUrl: null,
              }
            : item,
        ),
      );

      client.publish({
        destination: `/app/community/${communityIdNumber}/messages/${numericMessageId}/delete`,
        body: "{}",
      });
    },
    [communityIdNumber],
  );

  const toggleHeartReaction = useCallback(
    async (messageId: string) => {
      const client = clientRef.current;
      if (!client?.connected) {
        throw new Error("Conexão em tempo real indisponível. Tente novamente em alguns instantes.");
      }

      const target = messagesRef.current.find((item) => item.id === messageId);
      if (!target || target.isDeleted) {
        return;
      }

      if (reactionLockByMessageIdRef.current.has(messageId)) {
        return;
      }

      reactionLockByMessageIdRef.current.add(messageId);

      const numericMessageId = asNumericMessageId(messageId);

      setMessages((current) =>
        current.map((item) => {
          if (item.id !== messageId) {
            return item;
          }

          const hadReaction = Boolean(item.hasHeartReaction);
          const nextCount = Math.max((item.heartCount ?? 0) + (hadReaction ? -1 : 1), 0);

          return {
            ...item,
            hasHeartReaction: !hadReaction,
            heartCount: nextCount,
          };
        }),
      );

      try {
        client.publish({
          destination: `/app/community/${communityIdNumber}/messages/${numericMessageId}/react`,
          body: JSON.stringify({ reactionType: "HEART" }),
        });
      } catch (error) {
        reactionLockByMessageIdRef.current.delete(messageId);

        setMessages((current) =>
          current.map((item) =>
            item.id === messageId
              ? {
                  ...item,
                  hasHeartReaction: target.hasHeartReaction,
                  heartCount: target.heartCount,
                }
              : item,
          ),
        );

        if (error instanceof Error && error.message) {
          throw error;
        }

        throw new Error("Nao foi possivel reagir a mensagem.");
      }

      // Se não vier evento por alguma razão, libera o lock para evitar travar o botão.
      setTimeout(() => {
        reactionLockByMessageIdRef.current.delete(messageId);
      }, 1500);
    },
    [communityIdNumber],
  );

  const publishTyping = useCallback(() => {
    const client = clientRef.current;
    if (!client?.connected) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < CLIENT_TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current = now;
    client.publish({
      destination: `/app/community/${communityIdNumber}/typing`,
      body: "{}",
    });
  }, [communityIdNumber]);

  return {
    messages,
    members,
    currentUserId,
    isLoadingMessages,
    isSendingMessage,
    isConnected,
    messageError,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleHeartReaction,
    syncLostMessages,
    refreshMembers,
    publishTyping,
  };
}
