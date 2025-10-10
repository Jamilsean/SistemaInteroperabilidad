// src/services/authService.ts
import api from "@/lib/api";
import type { MeUser } from "@/types/user";

type MeResponse =
  | { user: MeUser; roles?: Array<string | { name: string }>; permissions?: Array<string | { name: string }> }
  | (MeUser & { roles?: Array<string | { name: string }>; permissions?: Array<string | { name: string }> });

function normalizeRoles(r: any): string[] {
  if (!Array.isArray(r)) return [];
  return r.map((x: any) => (typeof x === "string" ? x : x?.name)).filter(Boolean);
}

export async function login(email: string, password: string) {
  // El backend debe setear cookies HttpOnly aquí
  const { data } = await api.post("/auth/login", { email, password });
  // No guardar tokens en front. Luego el caller puede llamar a getCurrentSession()
  return data;
}

export async function logoutRemote() {
  // Debe limpiar cookies en el servidor
  await api.post("/auth/logout");
}

export async function getCurrentSession(): Promise<{
  user: MeUser | null;
  roles: string[];
  permissions: string[];
}> {
  // Idealmente GET; si tu API es POST, déjalo en POST
  const { data } = await api.get<MeResponse>("/auth/me").catch(async (e) => {
    // fallback si el backend solo acepta POST
    if (e?.response?.status === 405) {
      const { data } = await api.post<MeResponse>("/auth/me");
      return { data };
    }
    throw e;
  });

  // Normaliza shapes { user: ... } o plano
  const user: MeUser | null = (data as any)?.user ?? (data as any) ?? null;
  const roles = normalizeRoles((data as any)?.roles);
  const permissions = normalizeRoles((data as any)?.permissions);

  // Valida mínimo
  if (!user || !user.id || !user.email) return { user: null, roles: [], permissions: [] };
  return { user, roles, permissions };
}

export const exchangeSSOCode = async (code: string) => {
  // Tu backend pidió { code }, aunque en URL lo llames token.
  // Aquí mapeamos token -> code.
  const { data } = await api.post("/auth/callback", { code });
  return data; // idealmente { user, roles, permissions } y setea cookies
};
