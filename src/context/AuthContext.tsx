// src/context/AuthContext.tsx
import React from "react";
import type { SSOUser } from "@/types/auth";
import { login as loginRemote, exchangeSSOCode, logoutRemote } from "@/services/authService";
import api, { setRefreshedHandler, setUnauthorizedHandler } from "@/lib/api";
import { STORAGE_KEYS } from "@/config/env";
import { useLocation } from "react-router-dom";

type MeUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};
type User = (SSOUser | MeUser) | null;

type AuthContextType = {
  user: User;
  roles: string[];
  permissions: string[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (code: string) => Promise<any>;
  logout: () => Promise<void>;
  token: null;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

// ---------- helpers ----------
const LS_USER = STORAGE_KEYS.USER ?? "app:user";
const LS_ROLES = "app:roles";
const LS_PERMS = "app:perms";
const PUBLIC_MATCHERS: (string | RegExp)[] = [
  "/", "/landingpage", "/landingPage", "/login", "/auth/callback",
  "/documentos", "/mapas", "/datasets",
  /^\/recursos\/\d+$/, // /recursos/:id (detalle público)
];

function isPublicPath(pathname: string) {
  return PUBLIC_MATCHERS.some((pat) =>
    typeof pat === "string" ? pat === pathname : pat.test(pathname)
  );
}
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
const normalizeUser = (raw: any): MeUser | null => {
  if (!raw) return null;
  const email = raw.email ?? raw.email_personal ?? "";
  const name = raw.name ?? raw.nombres ?? (email ? email.split("@")[0] : "Usuario");
  const now = new Date().toISOString();
  return {
    id: Number(raw.id ?? 0),
    name,
    email,
    email_verified_at: raw.email_verified_at ?? null,
    created_at: raw.created_at ?? now,
    updated_at: raw.updated_at ?? now,
  };
};
// const hasAdmin = (roles: string[]) => roles.some(r => r.toLowerCase() === "admin");

// aplanar roles/permissions desde payload del backend
function flattenAuth(payload: any): { roles: string[]; permissions: string[] } {
  const rawUser = payload?.user ?? payload;

  // roles por nombre
  const roleNames: string[] = Array.isArray(rawUser?.roles)
    ? rawUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name)).filter(Boolean)
    : [];

  // permisos directos por nombre
  const directPerms: string[] = Array.isArray(rawUser?.permissions)
    ? rawUser.permissions.map((p: any) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
    : [];

  // permisos que vienen embebidos dentro de cada rol
  const permsFromRoles: string[] = Array.isArray(rawUser?.roles)
    ? rawUser.roles.flatMap((r: any) =>
      Array.isArray(r?.permissions) ? r.permissions.map((p: any) => (typeof p === "string" ? p : p?.name)) : []
    )
      .filter(Boolean)
    : [];

  // si es admin, garantizamos todo lo normal, pero no inventamos permisos: seguimos mostrando lo que venga
  const mergedPerms = Array.from(new Set([...directPerms, ...permsFromRoles]));
  return { roles: roleNames, permissions: mergedPerms };
}

const provisionalFromEmail = (email: string): MeUser => {
  const base = (email || "usuario").split("@")[0];
  const proper = base.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const now = new Date().toISOString();
  return { id: 0, name: proper || "Usuario", email, email_verified_at: null, created_at: now, updated_at: now };
};

// ---------- refresh actual ----------
async function refreshSession(): Promise<{ user: MeUser | null; roles: string[]; permissions: string[] }> {
  // tu API es POST /auth/refresh
  const { data } = await api.post("/auth/refresh"); // devuelve { access_token, user{...} }
  const u = normalizeUser(data?.user);
  const flat = flattenAuth(data);
  return { user: u, roles: flat.roles, permissions: flat.permissions };
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // hidrata todo desde LS para evitar parpadeo
  const [user, setUser] = React.useState<User>(() => safeParse(localStorage.getItem(LS_USER), null));
  const [roles, setRoles] = React.useState<string[]>(() => safeParse(localStorage.getItem(LS_ROLES), []));
  const [permissions, setPermissions] = React.useState<string[]>(() => safeParse(localStorage.getItem(LS_PERMS), []));
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { pathname } = useLocation();

  // persistencia
  React.useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);
  React.useEffect(() => { localStorage.setItem(LS_ROLES, JSON.stringify(roles)); }, [roles]);
  React.useEffect(() => { localStorage.setItem(LS_PERMS, JSON.stringify(permissions)); }, [permissions]);

  // hooks del interceptor: cuando el backend refresca, actualiza
  React.useEffect(() => {
    setRefreshedHandler((payload: any) => {
      const u = normalizeUser(payload?.user ?? payload);
      if (u) setUser(u);
      const flat = flattenAuth(payload);
      setRoles(flat.roles);
      setPermissions(flat.permissions);
    });
    setUnauthorizedHandler(() => {
      // solo cuando realmente 401 en refresh
      setUser(null);
      setRoles([]);
      setPermissions([]);
      localStorage.removeItem(LS_USER);
      localStorage.removeItem(LS_ROLES);
      localStorage.removeItem(LS_PERMS);
    });
    return () => {
      setRefreshedHandler(null);
      setUnauthorizedHandler(null);
    };
  }, []);

  // bootstrap: intenta refrescar al montar, en focus, visibilitychange y cada 5 min
  React.useEffect(() => {
    let stopped = false;
    const onPublic = isPublicPath(pathname);
    if (onPublic) return;
    const run = async () => {
      try {
        const res = await refreshSession();
        if (stopped) return;
        if (res.user) setUser(res.user);
        setRoles(res.roles);
        setPermissions(res.permissions);
      } catch {
        // si falla, no borres lo que hay en memoria; el interceptor limpiará si 401 real
      }
    };

    run(); // al montar

    const onFocus = () => run();
    const onVisible = () => { if (document.visibilityState === "visible") run(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const iv = window.setInterval(run, 5 * 60 * 1000); // 5 min

    return () => {
      stopped = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(iv);
    };
  }, [pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginRemote(email, password); 
      // mapea inmediatamente
      const u = normalizeUser(res?.user);
      setUser(u ?? provisionalFromEmail(email.trim()));
      const flat = flattenAuth(res);
      setRoles(flat.roles);
      setPermissions(flat.permissions);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo iniciar sesión");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loginWithSSO = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await exchangeSSOCode(code);
      const payload: any = res?.data ?? res;
      const u = normalizeUser(payload?.user);
      setUser(u ?? provisionalFromEmail(payload?.user?.email ?? ""));
      const flat = flattenAuth(payload);
      setRoles(flat.roles);
      setPermissions(flat.permissions);
      return res;
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo iniciar sesión con SSO");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      localStorage.removeItem(LS_USER);
      localStorage.removeItem(LS_ROLES);
      localStorage.removeItem(LS_PERMS);
      await logoutRemote().catch(() => { });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    roles,
    permissions,
    loading,
    error,
    login,
    loginWithSSO,
    logout,
    token: null,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
