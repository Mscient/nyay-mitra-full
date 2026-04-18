/**
 * auth.ts — Client-side authentication utilities
 * Stores JWT in localStorage (compatible with current setup)
 * with automatic token refresh before expiry.
 */

const TOKEN_KEY = "nm_token";
const REFRESH_KEY = "nm_refresh";
const USER_KEY = "nm_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: "CITIZEN" | "ADVOCATE" | "STUDENT" | "ORG_ADMIN" | "PLATFORM_ADMIN";
  lang: string;
  avatarUrl?: string | null;
}

// ── Storage helpers ────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, refreshToken: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = "nm_authenticated=1; path=/; max-age=2592000; samesite=lax";
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "nm_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    // Decode without verify (verification happens server-side)
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Consider expired if within 60s of expiry
    return payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

export function getTokenExpiry(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

// ── Token refresh ──────────────────────────────────────────────────────────────
export async function refreshAuthToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearAuth();
      return false;
    }
    const data = await res.json();
    if (data.token && data.refreshToken) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Auto-refresh: call this once on app boot ───────────────────────────────────
export function scheduleTokenRefresh(): void {
  if (typeof window === "undefined") return;

  const expiry = getTokenExpiry();
  if (!expiry) return;

  // Refresh 2 minutes before expiry
  const msUntilRefresh = expiry - Date.now() - 2 * 60 * 1000;
  if (msUntilRefresh <= 0) {
    refreshAuthToken();
    return;
  }

  setTimeout(async () => {
    const success = await refreshAuthToken();
    if (success) scheduleTokenRefresh(); // Schedule next refresh
  }, msUntilRefresh);
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
  clearAuth();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore errors — local state already cleared
  }

  window.location.href = "/login";
}

// ── Auth headers for API calls ─────────────────────────────────────────────────
export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return { "Content-Type": "application/json" };
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
