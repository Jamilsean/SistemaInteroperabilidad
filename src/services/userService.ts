import api from "@/lib/api"
import { API_BASE_URL } from "@/config/env";
import type { GetUsuariosParams, RegisterUserOk, RegisterUserPayload, ToggleStatusOk, User, UsersResponse, UsuariosResponse } from "@/types/user";
export async function getUsers(): Promise<UsersResponse> {
  const { data } = await api.get<UsersResponse>(`${API_BASE_URL}/usuarios`);
  return data;
}
export async function getUserById(id: number): Promise<User> {
  const { data } = await api.get<User>(`${API_BASE_URL}/usuarios/${id}`);
  return data;
}
export async function getUsuarios(
  params: GetUsuariosParams = {}
): Promise<UsuariosResponse> {
  const { data } = await api.get<UsuariosResponse>("/usuarios", { params });
  return data;
}

// PATCH /v1/users/{id}/status
export async function toggleUsuarioStatus(id: number): Promise<ToggleStatusOk> {
  const { data } = await api.patch<ToggleStatusOk>(`/users/${id}/status`);
  return data;
}

// POST /v1/auth/register
export async function registerUsuario(
  payload: RegisterUserPayload
): Promise<RegisterUserOk> {
  const { data } = await api.post<RegisterUserOk>("/auth/register", payload);
  return data;
}