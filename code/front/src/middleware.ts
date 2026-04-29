import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_GUARD_COOKIE_KEY } from "@/services/auth";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const hasAuthCookie = request.cookies.get(AUTH_GUARD_COOKIE_KEY)?.value === "1";

  if (!hasAuthCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAuthCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
