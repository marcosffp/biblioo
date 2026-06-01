import { getAccessToken } from "@/services/auth";

export function optionalBearerHeaders(token?: string | null): HeadersInit {
  const resolved = token ?? getAccessToken();
  return resolved ? { Authorization: `Bearer ${resolved}` } : {};
}

export function requiredBearerHeaders(token?: string | null): HeadersInit {
  const resolved = token ?? getAccessToken();
  if (!resolved) throw new Error("missing_access_token");
  return { Authorization: `Bearer ${resolved}` };
}

export function jsonBearerHeaders(token?: string | null): HeadersInit {
  const resolved = token ?? getAccessToken();
  if (!resolved) throw new Error("missing_access_token");
  return { Authorization: `Bearer ${resolved}`, "Content-Type": "application/json" };
}
