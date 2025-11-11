// src/lib/http-error.ts
export type ServerError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  raw?: unknown;
};

export function parseAxiosError(e: any): ServerError {
  const status = e?.response?.status ?? 0;
  const data = e?.response?.data;
  const statusText = e?.response?.statusText;

  let message =
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error === "string" && data.error) ||
    (typeof data === "string" && data) ||
    (status === 0 ? "Error de conexión" : "Error al procesar la solicitud");

   if (status === 403 && !data?.message) {
    message = "Tu cuenta no está activa. Contacta al administrador.";
  }

  const errors =
    data?.errors && typeof data.errors === "object"
      ? (data.errors as Record<string, string[]>)
      : undefined;

  return { status, message: message || statusText || "Error", errors, raw: data };
}
