import { getAccessToken } from "./auth";

import { API_BASE_URL } from "@/lib/api-config";

import type { VotingPage, VotingResponse, CreateVotingRequest } from "@/types/api";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function requireOk(response: Response): Promise<void> {
  if (!response.ok) {
    let message = "Erro na operação de votação.";
    try {
      const body = (await response.clone().json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
}

export async function getVotings(communityId: number, page = 0): Promise<VotingPage> {
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings?page=${page}&size=10`,
    { headers: authHeaders() },
  );
  await requireOk(response);
  return response.json() as Promise<VotingPage>;
}

export async function createVoting(
  communityId: number,
  request: CreateVotingRequest,
): Promise<VotingResponse> {
  const response = await fetch(`${API_BASE_URL}/communities/${communityId}/votings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}

export async function publishVoting(
  communityId: number,
  votingId: number,
): Promise<VotingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings/${votingId}/publish`,
    { method: "POST", headers: authHeaders() },
  );
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}

export async function castVote(
  communityId: number,
  votingId: number,
  optionId: number,
): Promise<VotingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings/${votingId}/vote`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ optionId }),
    },
  );
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}

export async function closeVoting(
  communityId: number,
  votingId: number,
): Promise<VotingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings/${votingId}/close`,
    { method: "POST", headers: authHeaders() },
  );
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}

export async function approveVoting(
  communityId: number,
  votingId: number,
  winnerOptionId?: number,
): Promise<VotingResponse> {
  const body: Record<string, number> = {};
  if (winnerOptionId !== undefined) body.winnerOptionId = winnerOptionId;
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings/${votingId}/approve`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
  );
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}

export async function rejectVoting(
  communityId: number,
  votingId: number,
  reason: string,
): Promise<VotingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/communities/${communityId}/votings/${votingId}/reject`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    },
  );
  await requireOk(response);
  return response.json() as Promise<VotingResponse>;
}
