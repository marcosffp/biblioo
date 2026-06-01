import { requiredBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type {
  BackendCommunityMessage,
  BackendCommunityMember,
  MessageMediaUploadResponse,
} from "@/types/api";

interface BackendPageResponse<T> {
  content: T[];
}

class CommunityMessagesApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CommunityMessagesApiError";
    this.status = status;
  }
}


async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.clone().json()) as { message?: string };
    return data.message ?? "";
  } catch {
    return "";
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityMessagesApiError(message || fallbackMessage, response.status);
  }

  return (await response.json()) as T;
}

export async function getCommunityRecentMessages(communityId: number): Promise<BackendCommunityMessage[]> {
  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/messages`, {
    headers: requiredBearerHeaders(),
  });

  return parseJsonResponse<BackendCommunityMessage[]>(response, "Falha ao carregar mensagens da comunidade.");
}

export async function getCommunityMessagesBefore(
  communityId: number,
  beforeId: number,
  limit = 50,
): Promise<BackendCommunityMessage[]> {
  const query = new URLSearchParams();
  query.set("before", String(beforeId));
  query.set("limit", String(limit));

  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/messages?${query.toString()}`, {
    headers: requiredBearerHeaders(),
  });

  return parseJsonResponse<BackendCommunityMessage[]>(response, "Falha ao carregar mensagens anteriores.");
}

export async function syncCommunityMessagesAfter(
  communityId: number,
  afterId: number,
): Promise<BackendCommunityMessage[]> {
  const query = new URLSearchParams();
  query.set("after", String(afterId));

  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/messages/sync?${query.toString()}`, {
    headers: requiredBearerHeaders(),
  });

  return parseJsonResponse<BackendCommunityMessage[]>(response, "Falha ao sincronizar mensagens.");
}

export async function getCommunityMembers(communityId: number): Promise<BackendCommunityMember[]> {
  const query = new URLSearchParams();
  query.set("page", "0");
  query.set("size", "200");

  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members?${query.toString()}`, {
    headers: requiredBearerHeaders(),
  });

  const page = await parseJsonResponse<BackendPageResponse<BackendCommunityMember>>(
    response,
    "Falha ao carregar membros da comunidade.",
  );

  return page.content ?? [];
}

export function getCommunityWebSocketEndpoint(): string {
  return `${API_BASE_URL}/ws/community`;
}

export async function uploadCommunityMessageMedia(
  communityId: number,
  params: {
    images?: File[];
    gif?: File | null;
  },
): Promise<MessageMediaUploadResponse> {
  const body = new FormData();

  params.images?.forEach((file) => {
    body.append("images", file);
  });

  if (params.gif) {
    body.append("gif", params.gif);
  }

  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/messages/media`, {
    method: "POST",
    headers: requiredBearerHeaders(),
    body,
  });

  return parseJsonResponse<MessageMediaUploadResponse>(response, "Falha ao fazer upload de mídia da mensagem.");
}
