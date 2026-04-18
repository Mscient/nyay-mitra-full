import { NextRequest, NextResponse } from "next/server";

// ── Routes that require authentication ───────────────────────────────────────
const PROTECTED_ROUTES = [
  "/dashboard",
  "/vakil-sahayak",
];

// ── Routes that redirect authenticated users away ─────────────────────────────
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if token exists in cookies (for SSR protection)
  // Client-side auth uses localStorage — middleware uses a lightweight cookie signal
  const hasAuthCookie = request.cookies.has("nm_authenticated");

  // Protect dashboard and CRM routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect away from login/register if already authed
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vakil-sahayak/:path*",
    "/login",
    "/register",
  ],
};
