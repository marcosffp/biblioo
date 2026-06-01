import { jsonBearerHeaders, optionalBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type { GenreResponse, UserPreferenceResponse } from "@/types/api";

export class PreferenceApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PreferenceApiError";
    this.status = status;
  }
}

export async function getGenres(): Promise<GenreResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/genres`, { headers: optionalBearerHeaders() });
  } catch {
    throw new PreferenceApiError("Não foi possível conectar ao servidor.");
  }
  if (!response.ok) {
    throw new PreferenceApiError("Falha ao carregar gêneros.", response.status);
  }
  return response.json() as Promise<GenreResponse[]>;
}

export async function saveUserPreferences(
  genres: string[],
  bookIds: number[] = []
): Promise<UserPreferenceResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/preferences`, {
      method: "POST",
      headers: jsonBearerHeaders(),
      body: JSON.stringify({ genres, bookIds }),
    });
  } catch {
    throw new PreferenceApiError("Não foi possível conectar ao servidor.");
  }
  if (!response.ok) {
    throw new PreferenceApiError("Falha ao salvar preferências.", response.status);
  }
  return response.json() as Promise<UserPreferenceResponse>;
}
