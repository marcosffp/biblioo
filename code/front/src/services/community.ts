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

export interface PendingCommunityInviteResponse {
  id: number;
  communityId: number;
  communityName: string;
  inviterId: number;
  inviterUsername: string;
  status: string;
  createdAt: string;
}

export interface PendingCommunityJoinRequestResponse {
  id: number;
  userId: number;
  username: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
}

export interface CreateCommunityPayload {
  name: string;
  description?: string;
  type: BackendCommunityType;
  bookId: number;
}

export interface CommunityActionResult {
  success: true;
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

export async function joinCommunity(communityId: number, token?: string | null): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para entrar na comunidade.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao entrar na comunidade.", response.status);
  }

  return { success: true };
}

export async function joinCommunityByInviteLink(
  inviteToken: string,
  token?: string | null,
): Promise<CommunityActionResult> {
  const normalizedToken = inviteToken.trim();

  if (!normalizedToken) {
    throw new CommunityApiError("Codigo de convite invalido.", 400);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/join/${encodeURIComponent(normalizedToken)}`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para entrar com convite.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao entrar na comunidade com convite.", response.status);
  }

  return { success: true };
}

export async function requestCommunityJoin(
  communityId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/join-requests`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para solicitar entrada.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao solicitar entrada na comunidade.", response.status);
  }

  return { success: true };
}

export async function inviteUserToCommunity(
  communityId: number,
  inviteeId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/invites`, {
      method: "POST",
      headers: {
        ...withRequiredBearerHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteeId }),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para convidar o usuario.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao enviar convite para a comunidade.", response.status);
  }

  return { success: true };
}

export async function acceptCommunityInvite(
  inviteId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/invites/${inviteId}/accept`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para aceitar o convite.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao aceitar convite da comunidade.", response.status);
  }

  return { success: true };
}

export async function declineCommunityInvite(
  inviteId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/invites/${inviteId}/decline`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para recusar o convite.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao recusar convite da comunidade.", response.status);
  }

  return { success: true };
}

export async function listPendingCommunityInvites(
  page = 0,
  size = 20,
  token?: string | null,
): Promise<PendingCommunityInviteResponse[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/invites/pending?page=${page}&size=${size}`, {
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel carregar convites pendentes.");
  }

  const data = await parseJsonResponse<BackendPageResponse<PendingCommunityInviteResponse>>(
    response,
    "Falha ao carregar convites pendentes.",
  );

  return data.content ?? [];
}

export async function listPendingCommunityJoinRequests(
  communityId: number,
  page = 0,
  size = 20,
  token?: string | null,
): Promise<PendingCommunityJoinRequestResponse[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/join-requests?page=${page}&size=${size}`, {
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel carregar solicitacoes pendentes.");
  }

  const data = await parseJsonResponse<BackendPageResponse<PendingCommunityJoinRequestResponse>>(
    response,
    "Falha ao carregar solicitacoes pendentes.",
  );

  return data.content ?? [];
}

export async function approveCommunityJoinRequest(
  requestId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/join-requests/${requestId}/approve`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para aprovar solicitacao.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao aprovar solicitacao de entrada.", response.status);
  }

  return { success: true };
}

export async function rejectCommunityJoinRequest(
  requestId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/join-requests/${requestId}/reject`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para rejeitar solicitacao.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao rejeitar solicitacao de entrada.", response.status);
  }

  return { success: true };
}

export async function removeCommunityMember(
  communityId: number,
  userId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/members/${userId}`, {
      method: "DELETE",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel conectar ao servidor para remover o membro.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao remover membro da comunidade.", response.status);
  }

  return { success: true };
}

export async function generateCommunityInviteLink(
  communityId: number,
  token?: string | null,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/invite-link`, {
      method: "POST",
      headers: withRequiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Nao foi possivel gerar o codigo de convite.");
  }

  const data = await parseJsonResponse<{ inviteLink: string }>(response, "Falha ao gerar codigo de convite.");
  return data.inviteLink;
}
