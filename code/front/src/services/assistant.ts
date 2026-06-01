import { jsonBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type { AssistantChatRequest, AssistantChatResponse, AssistantConversationSummary } from "@/types/api";

class AssistantApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AssistantApiError";
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

export async function sendAssistantMessage(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: "POST",
      headers: jsonBearerHeaders(),
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
      headers: jsonBearerHeaders(),
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
