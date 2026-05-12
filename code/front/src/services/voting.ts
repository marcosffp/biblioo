import { getAccessToken } from "./auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export type VotingStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "APPROVED" | "REJECTED";
export type TieBreakRule = "RANDOM_DRAW" | "ADMIN_CHOICE";

export interface VotingOptionResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl: string | null;
  voteCount: number;
}

export interface VotingResponse {
  id: number;
  communityId: number;
  title: string;
  status: VotingStatus;
  tieBreakRule: TieBreakRule;
  startsAt: string;
  endsAt: string;
  closedAt: string | null;
  winnerOptionId: number | null;
  rejectionReason: string | null;
  createdBy: number;
  createdAt: string;
  options: VotingOptionResponse[];
  myVotedOptionId: number | null;
}

export interface VotingPage {
  content: VotingResponse[];
  totalElements: number;
  last: boolean;
}

export interface VotingEventPayload {
  eventType: "VOTING_CREATED" | "VOTE_UPDATED" | "VOTING_CLOSED" | "VOTING_APPROVED" | "VOTING_REJECTED";
  data: VotingResponse;
}

export interface CreateVotingRequest {
  title: string;
  tieBreakRule: TieBreakRule;
  startsAt: string;
  endsAt: string;
  options: { bookId: number }[];
}

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
