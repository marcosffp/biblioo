import { AuthSession, LoginRequest, RegisterRequest } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const AUTH_SESSION_STORAGE_KEY = "biblioo.auth.session";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_IN_USE"
  | "USERNAME_IN_USE"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

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
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    throw await mapAuthError(response, "login");
  }

  const session = (await response.json()) as AuthSession;

  if (!session.accessToken || !session.refreshToken) {
    throw new AuthApiError("UNKNOWN", "Resposta de autenticacao invalida.", response.status);
  }

  saveAuthSession(session);
  return session;
}

export async function registerWithEmailPassword(payload: RegisterRequest): Promise<AuthSession> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    throw await mapAuthError(response, "register");
  }

  const session = (await response.json()) as AuthSession;

  if (!session.accessToken || !session.refreshToken) {
    throw new AuthApiError("UNKNOWN", "Resposta de autenticacao invalida.", response.status);
  }

  saveAuthSession(session);
  return session;
}

async function mapAuthError(response: Response, mode: "login" | "register"): Promise<AuthApiError> {
  const errorDetails = await readErrorDetails(response);

  if (mode === "login" && (response.status === 401 || response.status === 403)) {
    return new AuthApiError("INVALID_CREDENTIALS", "E-mail ou senha inválidos.", response.status);
  }

  if (mode === "register" && response.status === 409) {
    const lowered = errorDetails.toLowerCase();

    if (lowered.includes("username") || lowered.includes("usuario") || lowered.includes("usuário")) {
      return new AuthApiError("USERNAME_IN_USE", "Esse nome de usuário já está em uso.", response.status);
    }

    return new AuthApiError("EMAIL_IN_USE", "Esse e-mail já está em uso.", response.status);
  }

  if (response.status === 400 || response.status === 422) {
    return new AuthApiError("VALIDATION", "Confira os dados informados e tente novamente.", response.status);
  }

  return new AuthApiError("UNKNOWN", "Não foi possível autenticar. Tente novamente.", response.status);
}

async function readErrorDetails(response: Response): Promise<string> {
  try {
    const data = (await response.clone().json()) as {
      message?: string;
      errors?: Array<{ field?: string; message?: string }>;
    };

    const fieldMessages = data.errors?.map((item) => `${item.field ?? ""} ${item.message ?? ""}`.trim()).join(" ");
    return `${data.message ?? ""} ${fieldMessages ?? ""}`.trim();
  } catch {
    return "";
  }
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

