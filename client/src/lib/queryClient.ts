import { QueryClient } from "@tanstack/react-query";

// Use port proxy for deployed environments
const API_BASE = (typeof window !== "undefined" && (window as any).__PORT_5000__)
  ? (window as any).__PORT_5000__
  : "";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function apiRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<Response> {
  const executeReq = async (currentToken: string | null) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;

    return fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // ensuring Set-Cookie is honored during login
    });
  };

  let res = await executeReq(getToken());

  if (res.status === 401 || res.status === 403) {
    // Attempt Token Refresh
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            setToken(data.token);
            return data.token;
          }
          return null;
        })
        .catch(() => null)
        .finally(() => {
          isRefreshing = false;
        });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      // Retry original request with fresh token
      res = await executeReq(newToken);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res;
}

// Token helpers (in-memory only — no localStorage/sessionStorage)
let _token: string | null = null;
export function setToken(t: string | null) { _token = t; }
export function getToken(): string | null { return _token; }

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      queryFn: async ({ queryKey }) => {
        const url = (Array.isArray(queryKey) ? queryKey[0] : queryKey) as string;
        const res = await apiRequest("GET", url);
        return res.json();
      },
    },
  },
});
