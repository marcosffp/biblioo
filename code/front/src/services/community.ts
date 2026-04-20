import { getAccessToken } from "@/services/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export type BackendCommunityType = "PUBLIC" | "PRIVATE";

export interface BackendCommunityResponse {
  id: number;
  name: string;
  description?: string | null;
  type: BackendCommunityType;
  bookId: number;
  ownerId: number;
  memberCount: number;
  createdAt: string;
}

interface BackendPageResponse<T> {
  content: T[];
}

export interface CreateCommunityPayload {
  name: string;
  description?: string;
  type: BackendCommunityType;
  bookId: number;
}

export class CommunityApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CommunityApiError";
    this.status = status;
  }
}

interface ListCommunitiesParams {
  mine?: boolean;
  q?: string;
  page?: number;
  size?: number;
  token?: string | null;
}

function resolveToken(token?: string | null): string | null {
  return token ?? getAccessToken();
}

function withOptionalBearerHeaders(token?: string | null): HeadersInit {
  const resolved = resolveToken(token);
  return resolved ? { Authorization: `Bearer ${resolved}` } : {};
}

function withRequiredBearerHeaders(token?: string | null): HeadersInit {
  const resolved = resolveToken(token);

  if (!resolved) {
    throw new CommunityApiError("Usuário não autenticado.", 401);
  }

  return {
    Authorization: `Bearer ${resolved}`,
  };
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
    throw new CommunityApiError(message || fallbackMessage, response.status);
  }

  return (await response.json()) as T;
}

export async function listCommunities({
  mine = false,
  q,
  page = 0,
  size = 20,
  token,
}: ListCommunitiesParams = {}): Promise<BackendCommunityResponse[]> {
  const endpoint = mine ? "/communities/mine" : "/communities";
  const query = new URLSearchParams();

  query.set("page", String(page));
  query.set("size", String(size));

  if (!mine && q?.trim()) {
    query.set("q", q.trim());
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}?${query.toString()}`, {
      headers: withOptionalBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possível carregar comunidades.");
  }

  const data = await parseJsonResponse<BackendPageResponse<BackendCommunityResponse>>(
    response,
    "Falha ao carregar comunidades.",
  );

  return data.content ?? [];
}

export async function createCommunity(payload: CreateCommunityPayload, token?: string | null): Promise<BackendCommunityResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities`, {
      method: "POST",
      headers: {
        ...withRequiredBearerHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new CommunityApiError("Não foi possível conectar ao servidor para criar a comunidade.");
  }

  return parseJsonResponse<BackendCommunityResponse>(response, "Falha ao criar comunidade.");
}
