// src/services/recursoService.ts
import { API_BASE_URL } from "@/config/env"
import api from "@/lib/api"
 import type { RecursoDetalle, RecursosResponse } from "@/types/recursos"


export const listRecursos = async (page: number = 1): Promise<RecursosResponse> => {
  const { data } = await api.get<RecursosResponse>(`/recursos?page=${page}`)
  return data
}
export const getRecursos = async (page = 1, per_page = 5, repositorio_id: number[] = [], search = "", search_in = "title", sort_by = "title", sort_dir = "asc") => {
  const params: any = {
    page,
    per_page,
    repositorio_id,
    search_in,
    sort_by,
    sort_dir,
  };

  if (search) {
    params.search = search;
  }

  const { data } = await api.get<RecursosResponse>(`${API_BASE_URL}/recursos`, { params });
  return data;
};
export const getRecursoById = async (id: number): Promise<RecursoDetalle> => {
  const { data } = await api.get<RecursoDetalle>(`/recursos/${id}`);
  return data;
};