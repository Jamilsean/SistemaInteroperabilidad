import { API_BASE_URL } from "@/config/env";
import api from "@/lib/api"
import type { CrearRelacionPayload, CrearRelacionResponse, EliminarRelacionResponse, RelacionesResponse } from "@/types/relaciones";
 

export const getRelaciones = async (esta_aprobada=2,page = 1, per_page = 10, search = "",search_in
 = "", sort_by = "updated_at", sort_dir = "desc") => {
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