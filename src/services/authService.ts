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
   const { data } = await api.post("/auth/login", { email, password });
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
   const { data } = await api.get<MeResponse>("/auth/me").catch(async (e) => {
     if (e?.response?.status === 405) {
      const { data } = await api.post<MeResponse>("/auth/me");
      return { data };
    }
    throw e;
  });

  // Normaliza  
  const user: MeUser | null = (data as any)?.user ?? (data as any) ?? null;
  const roles = normalizeRoles((data as any)?.roles);
  const permissions = normalizeRoles((data as any)?.permissions);

  // Valida mínimo
  if (!user || !user.id || !user.email) return { user: null, roles: [], permissions: [] };
  return { user, roles, permissions };
}

export const exchangeSSOCode = async (code: string) => {

  const { data } = await api.post("/auth/callback", { code });
  return data;
};
