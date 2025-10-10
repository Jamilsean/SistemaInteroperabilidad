// src/services/roleService.ts
import { api } from "@/lib/api";
import type {
  PermissionsResponse,
  RolesListResponse,
  GetRolesParams,
  CreateRolePayload,
  UpdateRolePayload,
  OneRoleResponse,
} from "@/types/role";
import { API_BASE_URL } from "@/config/env";

 export async function listPermissions() {
  const { data } = await api.get<PermissionsResponse>(`${API_BASE_URL}/permissions`);
  return data.data;
}

 export async function listRoles(params: GetRolesParams = {}) {
  const { data } = await api.get<RolesListResponse>(`${API_BASE_URL}/roles`, { params });
  return data;
}

 export async function getRole(id: number) {
  const { data } = await api.get<OneRoleResponse>(`${API_BASE_URL}/roles/${id}`);
  return data.data;
}

 export async function createRole(payload: CreateRolePayload) {
  const { data } = await api.post(`${API_BASE_URL}/roles`, payload);
  return data;
}

 export async function updateRole(id: number, payload: UpdateRolePayload) {
  const { data } = await api.put(`${API_BASE_URL}/roles/${id}`, payload);
  return data;
}

 export async function deleteRole(id: number) {
  const { data } = await api.delete(`${API_BASE_URL}/roles/${id}`);
  return data;
}
