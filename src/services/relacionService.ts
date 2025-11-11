import { API_BASE_URL } from "@/config/env";
import api from "@/lib/api"
import type { CrearRelacionPayload, CrearRelacionResponse, EliminarRelacionResponse, RelacionesResponse } from "@/types/relaciones";


export type EstadoAprobacion =
  "all"
  | "por_evaluar"
  | "evaluando"
  | "aprobada"
  | "desaprobada"
  | "desierto";

export type RelacionesQuery = {
  page?: number | null;
  per_page?: number | null;
  estado_aprobacion?: EstadoAprobacion | "";
  search?: string;
  search_in?: string;
  sort_by?: "id" | "confianza" | "tipo_relacion" | "estado_aprobacion" | "created_at" | "updated_at";
  sort_dir?: "asc" | "desc";
};

export async function getRelacionesQuery(q: RelacionesQuery): Promise<RelacionesResponse> {
  const params: any = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
    search_in: q.search_in ?? "*",
    sort_by: q.sort_by ?? "updated_at",
    sort_dir: q.sort_dir ?? "desc",
  };
  if (q.search?.trim()) params.search = q.search.trim();
  if (q.estado_aprobacion) params.estado_aprobacion = q.estado_aprobacion;
  const { data } = await api.get<RelacionesResponse>("/relaciones", { params });
  return data;
}
export const getRelaciones = async (esta_aprobada = 2, page = 1, per_page = 10, search = "", search_in
  = "", sort_by = "created_at", sort_dir = "asc") => {
  const params: any = {
    esta_aprobada,
    page,
    search_in,
    per_page,
    sort_by,
    sort_dir,
  };

  if (search) {
    params.search = search;
  }

  const { data } = await api.get<RelacionesResponse>(`${API_BASE_URL}/relaciones`, { params });
  return data;
};

export const crearRelacion = async (
  payload: CrearRelacionPayload
): Promise<CrearRelacionResponse> => {
  const { data } = await api.post<CrearRelacionResponse>(
    `${API_BASE_URL}/relaciones`,
    payload
  );
  return data;
};

;
export const eliminarRelacion = async (
  idRelacion: number
): Promise<EliminarRelacionResponse> => {
  const { data } = await api.delete<EliminarRelacionResponse>(
    `${API_BASE_URL}/relaciones/${idRelacion}`
  );
  return data;
};