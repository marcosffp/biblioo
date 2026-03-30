import { AuthSession, LoginRequest } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const AUTH_SESSION_STORAGE_KEY = "biblioo.auth.session";

export type AuthErrorCode = "INVALID_CREDENTIALS" | "NETWORK" | "UNKNOWN";

export class AuthApiError extends Error {
  readonly status?: number;
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
  }
}

export async function loginWithEmailPassword(payload: LoginRequest): Promise<AuthSession> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Nao foi possivel conectar ao servidor.");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthApiError("INVALID_CREDENTIALS", "Email ou senha invalidos.", response.status);
    }

    throw new AuthApiError("UNKNOWN", "Nao foi possivel autenticar. Tente novamente.", response.status);
  }

  const session = (await response.json()) as AuthSession;

  if (!session.accessToken || !session.refreshToken) {
    throw new AuthApiError("UNKNOWN", "Resposta de autenticacao invalida.", response.status);
  }

  saveAuthSession(session);
  return session;
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}
