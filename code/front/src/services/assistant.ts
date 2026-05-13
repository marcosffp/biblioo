import { getAccessToken } from "@/services/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export interface AssistantChatRequest {
  message: string;
  conversationId?: string | null;
}

export interface AssistantChatResponse {
  reply: string;
  conversationId: string;
}

export interface AssistantConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

class AssistantApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AssistantApiError";
    this.status = status;
  }
}

function buildAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new AssistantApiError("Usuário não autenticado.", 401);
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
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

export async function sendAssistantMessage(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(request),
    });
  } catch {
    throw new AssistantApiError("Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);

    if (response.status === 429) {
      throw new AssistantApiError(
        "Limite de mensagens atingido. Aguarde um momento e tente novamente.",
        429,
      );
    }

    throw new AssistantApiError(
      message || "Não foi possível enviar a mensagem. Tente novamente.",
      response.status,
    );
  }

  return (await response.json()) as AssistantChatResponse;
}

export async function listAssistantConversations(): Promise<AssistantConversationSummary[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/assistant/conversations`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new AssistantApiError("Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new AssistantApiError(
      message || "Não foi possível carregar as conversas.",
      response.status,
    );
  }

  return (await response.json()) as AssistantConversationSummary[];
}
