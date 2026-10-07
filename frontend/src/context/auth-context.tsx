"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-url";

export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
};

type AuthSessionInput = AuthUser & {
  token?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setAuthSession: (session: AuthSessionInput) => void;
  refreshMe: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
};

const TOKEN_STORAGE_KEY = "group54_token";
const USER_STORAGE_KEY = "group54_user";

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const found = document.cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("group54_session="));
  return found ? decodeURIComponent(found.split("=")[1] ?? "") : null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthSession = useCallback((session: AuthSessionInput) => {
    const cleanUser: AuthUser = {
      userId: session.userId,
      fullName: session.fullName,
      email: session.email,
      role: session.role,
    };

    setUser(cleanUser);

    if (session.token) {
      setToken(session.token);
      try {
        document.cookie = `group54_session=${session.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } catch {
        // Ignore cookie set errors
      }
    }

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cleanUser));
      if (session.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const buildHeaders = (tokenValue?: string | null) => {
        const headers = new Headers(init.headers ?? {});
        if (tokenValue) {
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${tokenValue}`);
          }
          if (!headers.has("x-auth-token")) {
            headers.set("x-auth-token", tokenValue);
          }
        }

        const sessionUser = user ?? getStoredUser();
        if (sessionUser) {
          if (!headers.has("x-user-id")) headers.set("x-user-id", sessionUser.userId);
          if (!headers.has("x-user-role")) headers.set("x-user-role", sessionUser.role);
          if (!headers.has("x-user-email")) headers.set("x-user-email", sessionUser.email);
          if (!headers.has("x-user-name")) headers.set("x-user-name", sessionUser.fullName);
        }
        return headers;
      };

      const resolvedInput = typeof input === "string" ? apiUrl(input) : input;
      const sessionUser = user ?? getStoredUser();
      const withAuthQuery = (() => {
        if (typeof resolvedInput !== "string" || !sessionUser) return resolvedInput;
        try {
          const u = new URL(resolvedInput, window.location.origin);
          if (!u.searchParams.get("auth_user_id")) u.searchParams.set("auth_user_id", sessionUser.userId);
          if (!u.searchParams.get("auth_user_email")) u.searchParams.set("auth_user_email", sessionUser.email);
          if (!u.searchParams.get("auth_user_role")) u.searchParams.set("auth_user_role", sessionUser.role);
          if (!u.searchParams.get("auth_user_name")) u.searchParams.set("auth_user_name", sessionUser.fullName);
          return u.toString();
        } catch {
          return resolvedInput;
        }
      })();

      const initialToken = token ?? getStoredToken() ?? getTokenFromCookie();
      let res = await fetch(withAuthQuery, {
        ...init,
        headers: buildHeaders(initialToken),
        credentials: "include",
        cache: init.cache ?? "no-store",
      });

      if (res.status !== 401) return res;

      // One silent refresh + retry for stubborn preview/iframe auth edge-cases.
      try {
        const meRes = await fetch(apiUrl("/api/auth/me"), {
          credentials: "include",
          cache: "no-store",
          headers: buildHeaders(initialToken),
        });
        const mePayload = await meRes.json();
        if (mePayload?.success && mePayload?.data?.token) {
          const freshToken = String(mePayload.data.token);
          setToken(freshToken);
          try {
            localStorage.setItem(TOKEN_STORAGE_KEY, freshToken);
            document.cookie = `group54_session=${freshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          } catch {
            // ignore
          }

          res = await fetch(withAuthQuery, {
            ...init,
            headers: buildHeaders(freshToken),
            credentials: "include",
            cache: init.cache ?? "no-store",
          });
        }
      } catch {
        // ignore and return original 401
      }

      return res;
    },
    [token, user],
  );

  const refreshMe = useCallback(async (): Promise<AuthUser | null> => {
    try {
      setLoading(true);
      const storedToken = getStoredToken() ?? getTokenFromCookie();
      const storedUser = getStoredUser();

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(storedUser);

      const headers: Record<string, string> = {};
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
        headers["x-auth-token"] = storedToken;
      }

      const res = await fetch(apiUrl("/api/auth/me"), {
        cache: "no-store",
        credentials: "include",
        headers,
      });
      const payload = await res.json();
      if (payload.success && payload.data) {
        const verifiedUser: AuthUser = {
          userId: payload.data.userId,
          fullName: payload.data.fullName,
          email: payload.data.email,
          role: payload.data.role,
        };
        setUser(verifiedUser);

        const refreshedToken = payload.data.token as string | undefined;
        if (refreshedToken) {
          setToken(refreshedToken);
        }

        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser));
          if (refreshedToken) {
            localStorage.setItem(TOKEN_STORAGE_KEY, refreshedToken);
            document.cookie = `group54_session=${refreshedToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
        } catch {
          // Ignore
        }
        return verifiedUser;
      }

      // Fallback for preview/iframe environments where cookie/header verification may lag.
      // Keep existing stored session instead of forcing logout immediately.
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        return storedUser;
      }

      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {
        // Ignore
      }
      return null;
    } catch {
      const fallback = getStoredUser();
      setUser(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(apiUrl("/api/auth/logout"), { method: "POST" });
    } catch {
      // Ignore
    }
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      document.cookie = "group54_session=; path=/; max-age=0";
    } catch {
      // Ignore
    }
    setUser(null);
    setToken(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ user, token, loading, setAuthSession, refreshMe, logout, authFetch }),
    [user, token, loading, setAuthSession, refreshMe, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
