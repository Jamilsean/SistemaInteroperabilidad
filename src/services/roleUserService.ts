// src/services/roleUserService.ts
import api from "@/lib/api";
import type {
  GetUserRolesPermsResponse,
  ListPermissionsResponse,
  ListRolesResponse,
} from "@/types/roleUser";

// === Usuario: roles & permisos actuales ===
export async function getUserRolesPermissions(userId: number): Promise<GetUserRolesPermsResponse> {
  const { data } = await api.get(`/users/${userId}/roles-permissions`);
  return data;
}

// === Acciones sobre roles del usuario ===
export async function assignUserRole(userId: number, role: string) {
  const { data } = await api.post(`/users/${userId}/roles-permissions/assign-role`, { role });
  return data; // { success?, message? }
}

export async function removeUserRole(userId: number, role: string) {
  const { data } = await api.post(`/users/${userId}/roles-permissions/remove-role`, { role });
  return data;
}

// === Acciones sobre permisos del usuario ===
export async function giveUserPermission(userId: number, permission: string) {
  const { data } = await api.post(`/users/${userId}/roles-permissions/give-permission`, { permission });
  return data;
}

export async function revokeUserPermission(userId: number, permission: string) {
  const { data } = await api.post(`/users/${userId}/roles-permissions/revoke-permission`, { permission });
  return data;
}

// === Catálogos para UI ===
export async function listAllPermissions(): Promise<ListPermissionsResponse> {
  const { data } = await api.get(`/permissions`);
  return data;
}

// Traer roles (los usamos solo para opciones). Ajusta per_page si tienes muchos:
export async function listAllRoles(per_page = 100): Promise<ListRolesResponse> {
  const { data } = await api.get(`/roles`, { params: { per_page } });
  return data;
}
