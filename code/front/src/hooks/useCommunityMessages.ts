import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/services/auth";
import {
  getCommunityMembers,
  getCommunityRecentMessages,
  getCommunityWebSocketEndpoint,
  syncCommunityMessagesAfter,
  type BackendCommunityMember,
  type BackendCommunityMessage,
  type BackendMessageEventPayload,
} from "@/services/community-messages";
import type { CommunityChatMessage, CommunityMember } from "@/hooks/useCommunity";

interface SendMessageInput {
  content: string;
  hasSpoiler: boolean;
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
  const username = item.username ?? `user${item.userId}`;

  return {
    id: String(item.userId),
    name: username,
    username,
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
    userName: isMine ? "Voce" : mappedUserName ?? `Usuario ${authorId}`,
    text: item.deleted ? "Mensagem removida" : item.content ?? "",
    time: formatMessageTime(item.createdAt),
    isMine,
    isSpoiler: item.hasSpoiler,
  };
}

export function useCommunityMessages(communityId: string) {
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messageError, setMessageError] = useState("");

  const clientRef = useRef<Client | null>(null);
  const isCancelledRef = useRef(false);
  const currentUserId = useMemo(() => decodeCurrentUserId(), []);
  const pendingByClientMessageIdRef = useRef<Map<string, string>>(new Map());
  const memberNameByIdRef = useRef<Map<string, string>>(new Map());

  const communityIdNumber = useMemo(() => Number(communityId), [communityId]);

  const replaceOrAppendMessage = useCallback((nextMessage: CommunityChatMessage, clientMessageId?: string | null) => {
    setMessages((current) => {
      const replacedById = current.map((item) => (item.id === nextMessage.id ? nextMessage : item));

      if (replacedById.some((item) => item.id === nextMessage.id)) {
        return replacedById;
      }

      if (clientMessageId) {
        const optimisticId = pendingByClientMessageIdRef.current.get(clientMessageId);
        if (optimisticId) {
          pendingByClientMessageIdRef.current.delete(clientMessageId);
          return replacedById.map((item) => (item.id === optimisticId ? nextMessage : item));
        }
      }

      return [...replacedById, nextMessage];
    });
  }, []);

  const handleCreatedEvent = useCallback(
    (payload: string) => {
      const event = parseMessageEvent(payload);
      if (event?.eventType !== "MESSAGE_CREATED") {
        return;
      }

      const mapped = mapBackendMessageToUi(event.data, {
        currentUserId,
        memberNameById: memberNameByIdRef.current,
      });

      replaceOrAppendMessage(mapped, event.data.clientMessageId);
    },
    [currentUserId, replaceOrAppendMessage],
  );

  const handleQueueErrorEvent = useCallback((payload: string) => {
    const event = parseMessageEvent(payload);
    const fallback = "Erro no envio de mensagem.";
    setMessageError(event?.data?.content || fallback);
  }, []);

  const onCreatedFrame = useCallback(
    (frame: IMessage) => {
      handleCreatedEvent(frame.body);
    },
    [handleCreatedEvent],
  );

  const onErrorFrame = useCallback((frame: IMessage) => {
    handleQueueErrorEvent(frame.body);
  }, [handleQueueErrorEvent]);

  const subscribeRealtimeTopics = useCallback(
    (client: Client, communityNumericId: number) => {
      client.subscribe(`/topic/community.${communityNumericId}`, onCreatedFrame);
      client.subscribe(`/user/queue/errors`, onErrorFrame);
    },
    [onCreatedFrame, onErrorFrame],
  );

  useEffect(() => {
    if (!Number.isFinite(communityIdNumber)) {
      setMessages([]);
      setMembers([]);
      setIsLoadingMessages(false);
      setIsConnected(false);
      setMessageError("Comunidade inválida.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setMessages([]);
      setMembers([]);
      setIsLoadingMessages(false);
      setIsConnected(false);
      setMessageError("Você precisa estar autenticado para acessar o chat.");
      return;
    }

    isCancelledRef.current = false;
    setIsLoadingMessages(true);
    setMessageError("");

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
      const currentClient = clientRef.current;
      clientRef.current = null;
      if (currentClient?.active) {
        currentClient.deactivate();
      }
    };
  }, [communityIdNumber, currentUserId, subscribeRealtimeTopics]);

  const sendMessage = useCallback(
    async ({ content, hasSpoiler }: SendMessageInput) => {
      const normalizedContent = content.trim();
      if (!normalizedContent) {
        return;
      }

      const client = clientRef.current;
      if (!client?.connected) {
        throw new Error("Conexão em tempo real indisponível. Tente novamente em alguns instantes.");
      }

      setIsSendingMessage(true);

      const clientMessageId = crypto.randomUUID();
      const optimisticId = `temp-${clientMessageId}`;
      pendingByClientMessageIdRef.current.set(clientMessageId, optimisticId);

      const optimisticMessage: CommunityChatMessage = {
        id: optimisticId,
        userId: currentUserId ?? "me",
        userName: "Voce",
        text: normalizedContent,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        isSpoiler: hasSpoiler,
      };

      setMessages((current) => [...current, optimisticMessage]);

      try {
        client.publish({
          destination: `/app/community/${communityIdNumber}/send`,
          body: JSON.stringify({
            content: normalizedContent,
            parentMessageId: null,
            tags: [],
            images: [],
            gifUrl: null,
            hasSpoiler,
            clientMessageId,
          }),
        });
      } finally {
        setIsSendingMessage(false);
      }
    },
    [communityIdNumber, currentUserId],
  );

  const syncLostMessages = useCallback(async () => {
    const latestId = messages
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
  }, [communityIdNumber, currentUserId, messages, replaceOrAppendMessage]);

  return {
    messages,
    members,
    currentUserId,
    isLoadingMessages,
    isSendingMessage,
    isConnected,
    messageError,
    sendMessage,
    syncLostMessages,
  };
}
