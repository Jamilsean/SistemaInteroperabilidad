import { STORAGE_KEYS } from "@/config/env";
import type { LoginResponse } from "@/types/auth";

// Quita "Bearer " si viniera pegado y elimina comillas accidentales
function sanitizeToken(raw: string): string {
  let t = (raw ?? "").trim();
  if (t.toLowerCase().startsWith("bearer ")) t = t.slice(7).trim();
  // elimina comillas si lo guardaron como JSON string literal por error
  t = t.replace(/^"+|"+$/g, "");
  return t;
}

export function persistLogin(res: LoginResponse) {
  const raw = res.access_token;
  const clean = sanitizeToken(raw);

  // (Opcional) TTL por si lo usas en otro lado, no lo validaremos en el request
  const seconds = Number.parseInt(res.expires_in as unknown as string, 10);
  const ttlMs = Number.isFinite(seconds) ? seconds * 1000 : 3600 * 1000;
  const expiresAt = Date.now() + ttlMs;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, clean);
  // ¡Ignora token_type del backend! Forzamos 'Bearer'
  localStorage.setItem(STORAGE_KEYS.TOKEN, "Bearer");
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  if (res.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
}
