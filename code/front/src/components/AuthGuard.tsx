"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthSession, getAuthSession, isTokenExpired } from "@/services/auth";
import { getJwtExpiry } from "@/utils/jwt";

const PUBLIC_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_ROUTES.has(pathname)) return;

    const session = getAuthSession();

    if (!session || isTokenExpired(session.accessToken)) {
      clearAuthSession();
      const loginUrl = `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    const exp = getJwtExpiry(session.accessToken);
    if (!exp) return;

    const msUntilExpiry = exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) return;

    const timer = setTimeout(() => {
      clearAuthSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  return <>{children}</>;
}
