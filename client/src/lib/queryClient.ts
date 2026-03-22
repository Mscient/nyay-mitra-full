import { QueryClient } from "@tanstack/react-query";

// Use port proxy for deployed environments
const API_BASE = (typeof window !== "undefined" && (window as any).__PORT_5000__)
  ? (window as any).__PORT_5000__
  : "";

export async function apiRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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
