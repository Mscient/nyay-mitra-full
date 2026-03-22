import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiRequest, setToken } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
}

interface AuthContextType {
  user: PublicUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: string) => Promise<void>;
  logout: () => void;
  updateLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// In-memory token store (no localStorage/sessionStorage — blocked in sandbox)
let _memToken: string | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    _memToken = data.token;
    setToken(data.token);
    setUser(data.user);
    queryClient.invalidateQueries();
  }

  async function register(name: string, email: string, password: string, language = "en") {
    const res = await apiRequest("POST", "/api/auth/register", { name, email, password, preferredLanguage: language });
    const data = await res.json();
    _memToken = data.token;
    setToken(data.token);
    setUser(data.user);
    queryClient.invalidateQueries();
  }

  function logout() {
    _memToken = null;
    setToken(null);
    setUser(null);
    queryClient.clear();
  }

  async function updateLanguage(lang: string) {
    const res = await apiRequest("PATCH", "/api/auth/language", { language: lang });
    const data = await res.json();
    setUser(data);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
