import api from "@/lib/api";
 import type {
  SendPasswordCodePayload,
  SendPasswordCodeResponse,
  VerifyPasswordCodePayload,
  VerifyPasswordCodeResponse,
} from   "@/types/auth";
  

export async function sendPasswordCode(
  payload: SendPasswordCodePayload
): Promise<SendPasswordCodeResponse> {
  const { data } = await api.post<SendPasswordCodeResponse>("/auth/password/code/send", payload);
  return data;
}

export async function verifyPasswordCode(
  payload: VerifyPasswordCodePayload
): Promise<VerifyPasswordCodeResponse> {
  const { data } = await api.post<VerifyPasswordCodeResponse>("/auth/password/code/verify", payload);
  return data;
}
