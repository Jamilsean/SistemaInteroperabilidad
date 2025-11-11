// src/services/profileService.ts
import { api } from "@/lib/api";
import type {
  MeResponse,
  UpdatePasswordPayload,
  UpdatePasswordOk,
  UpdateProfilePayload,
  UpdateProfileOk,
} from "@/types/user";

const BASE = "/auth";

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.post<MeResponse>(`${BASE}/me`);
  return data;
}

export async function updateMyPassword(
  payload: UpdatePasswordPayload
): Promise<UpdatePasswordOk> {
  const { data } = await api.post<UpdatePasswordOk>(`${BASE}/user/reset`, payload);
  return data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileOk> {
  const { data } = await api.put<UpdateProfileOk>(`${BASE}/profile`, payload);
  return data;
}
