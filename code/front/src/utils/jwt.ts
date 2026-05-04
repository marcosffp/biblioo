export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtExpiry(token: string): number | null {
  const exp = parseJwtPayload(token)?.exp;
  return typeof exp === "number" ? exp : null;
}

export function getJwtUserId(token: string): string | null {
  const sub = parseJwtPayload(token)?.sub;
  return typeof sub === "string" ? sub : null;
}
