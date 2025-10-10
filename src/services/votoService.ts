import api from "@/lib/api"
import { API_BASE_URL } from "@/config/env";
import type {
  EnviarCorreosPayload,
  ApiMessageResponse,
  VotoDetalleResponse,
  RegistrarVotoPayload,
} from "@/types/voto";

/**
 * Enviar correos a especialistas para una relación
 * POST /v1/relaciones/{relacion}/enviar-correos
 * - Requiere token (via interceptor)
 * - Path param: relacion (ID)
 * - Body: { relacion_id, especialistas: number[] }
 * - Respuesta 200: { message: "Correos enviados a especialistas" }
 */
export async function enviarCorreosRelacion(
  relacion: number,
  payload: EnviarCorreosPayload
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>(
    `${API_BASE_URL}/relaciones/${relacion}/enviar-correos`,
    payload
  );
  return data;
}

/**
 * Obtener detalles de aprobación por token
 * GET /v1/votos/{token}
 * - No requiere Authorization si el endpoint es público por token (si tu backend exige, el interceptor lo enviará igual)
 * - Respuesta: { relacion: {...}, aprobacion: {...} }
 */
export async function getVotoDetalle(
  token: string
): Promise<VotoDetalleResponse> {
  const { data } = await api.get<VotoDetalleResponse>(
    `${API_BASE_URL}/votos/${encodeURIComponent(token)}`
  );
  return data;
}

/**
 * Registrar un voto por token
 * POST /v1/votos/{token}
 * - Body: { voto: "0" | "1", justificacion: string }
 * - Respuesta 200: { message: "Voto registrado correctamente" }
 */
export async function registrarVoto(
  token: string,
  payload: RegistrarVotoPayload
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>(
    `${API_BASE_URL}/votos/${encodeURIComponent(token)}`,
    payload
  );
  return data;
}
