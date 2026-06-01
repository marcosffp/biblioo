import { optionalBearerHeaders, requiredBearerHeaders, jsonBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type {
  BackendCommunityType,
  BackendCommunityResponse,
  PendingCommunityInviteResponse,
  PendingCommunityJoinRequestResponse,
  CreateCommunityPayload,
  CommunityActionResult,
} from "@/types/api";

interface BackendPageResponse<T> {
  content: T[];
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
      headers: optionalBearerHeaders(token),
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
      headers: jsonBearerHeaders(token),
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possível conectar ao servidor para entrar na comunidade.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para entrar com convite.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para solicitar entrada.");
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
      headers: jsonBearerHeaders(token),
      body: JSON.stringify({ inviteeId }),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para convidar o usuario.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para aceitar o convite.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para recusar o convite.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel carregar convites pendentes.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel carregar solicitações pendentes.");
  }

  const data = await parseJsonResponse<BackendPageResponse<PendingCommunityJoinRequestResponse>>(
    response,
    "Falha ao carregar solicitações pendentes.",
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para aprovar solicitacao.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para rejeitar solicitacao.");
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
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para remover o membro.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao remover membro da comunidade.", response.status);
  }

  return { success: true };
}

export async function leaveCommunity(
  communityId: number,
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/leave`, {
      method: "DELETE",
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para sair da comunidade.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao sair da comunidade.", response.status);
  }

  return { success: true };
}

export async function getCommunityInviteLink(
  communityId: number,
  token?: string | null,
): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel carregar os dados da comunidade.");
  }

  const data = await parseJsonResponse<{ inviteLink?: string | null }>(response, "Falha ao carregar dados da comunidade.");
  return data.inviteLink ?? null;
}

export async function revokeCommunityInviteLink(
  communityId: number,
  token?: string | null,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/invite-link`, {
      method: "DELETE",
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel revogar o codigo de convite.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao revogar codigo de convite.", response.status);
  }
}

export async function generateCommunityInviteLink(
  communityId: number,
  token?: string | null,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/invite-link`, {
      method: "POST",
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel gerar o codigo de convite.");
  }

  const data = await parseJsonResponse<{ inviteLink: string }>(response, "Falha ao gerar codigo de convite.");
  return data.inviteLink;
}

export async function changeCommunityMemberRole(
  communityId: number,
  userId: number,
  role: "MODERATOR" | "MEMBER",
  token?: string | null,
): Promise<CommunityActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}/members/${userId}/role`, {
      method: "PUT",
      headers: jsonBearerHeaders(token),
      body: JSON.stringify({ role }),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para alterar o cargo.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao alterar cargo do membro.", response.status);
  }

  return { success: true };
}

export async function deleteCommunity(
  communityId: number,
  token?: string | null,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
      method: "DELETE",
      headers: requiredBearerHeaders(token),
    });
  } catch {
    throw new CommunityApiError("Não foi possivel conectar ao servidor para excluir a comunidade.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new CommunityApiError(message || "Falha ao excluir comunidade.", response.status);
  }
}
