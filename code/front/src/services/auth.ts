import { AuthSession, LoginRequest, RegisterRequest } from "@/types";
import { getJwtExpiry } from "@/utils/jwt";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const AUTH_SESSION_STORAGE_KEY = "biblioo.auth.session";
export const AUTH_GUARD_COOKIE_KEY = "biblioo.authenticated";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_IN_USE"
  | "USERNAME_IN_USE"
  | "VALIDATION"
  | "NETWORK"
  | "RATE_LIMIT"
  | "INVALID_TOKEN"
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

function canUseLocalStorage(): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  try {
    return globalThis.window.localStorage !== undefined;
  } catch {
    return false;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getJwtExpiry(token);
  if (exp === null) return false;
  return Math.floor(Date.now() / 1000) >= exp;
}

function setAuthGuardCookie(accessToken: string): void {
  if (globalThis.window === undefined) {
    return;
  }

  try {
    const exp = getJwtExpiry(accessToken);
    const maxAge = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 3600;
    globalThis.document.cookie = `${AUTH_GUARD_COOKIE_KEY}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    // Ignore cookie errors and keep local session fallback.
  }
}

function clearAuthGuardCookie(): void {
  if (globalThis.window === undefined) {
    return;
  }

  try {
    globalThis.document.cookie = `${AUTH_GUARD_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // Ignore cookie errors during logout cleanup.
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
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  setAuthGuardCookie(session.accessToken);
}

export function getAuthSession(): AuthSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as AuthSession;

    if (isTokenExpired(parsed.accessToken)) {
      clearAuthSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  clearAuthGuardCookie();

  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}

export async function forgotPassword(email: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Não foi possível conectar ao servidor.");
  }

  if (response.status === 429) {
    throw new AuthApiError("RATE_LIMIT", "Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429);
  }

  if (!response.ok) {
    throw new AuthApiError("UNKNOWN", "Não foi possível enviar o e-mail. Tente novamente.", response.status);
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Não foi possível conectar ao servidor.");
  }

  if (response.status === 400 || response.status === 404 || response.status === 410) {
    throw new AuthApiError("INVALID_TOKEN", "Link inválido ou expirado. Solicite um novo.", response.status);
  }

  if (response.status === 422) {
    throw new AuthApiError("VALIDATION", "A senha não atende aos requisitos mínimos.", response.status);
  }

  if (!response.ok) {
    throw new AuthApiError("UNKNOWN", "Não foi possível redefinir a senha. Tente novamente.", response.status);
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    throw new AuthApiError("NETWORK", "Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    throw new AuthApiError("UNKNOWN", "Não foi possível autenticar com o Google.", response.status);
  }

  const session = (await response.json()) as AuthSession;

  if (!session.accessToken || !session.refreshToken) {
    throw new AuthApiError("UNKNOWN", "Resposta de autenticação inválida.", response.status);
  }

  saveAuthSession(session);
  return session;
}

