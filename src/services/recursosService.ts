// src/services/recursoService.ts
import { API_BASE_URL } from "@/config/env"
import api from "@/lib/api"
import apiPublic from "@/lib/api-public"
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
export const getRecursosWithMeilisearch = async (
  page = 1,
  per_page = 5,
  repositorio_id: number[] = [],
  search = "",
  search_in: "title" | "autores" | "abstract" | "key_words" = "title",
  sort_by: "title" | "autores" | "abstract" | "key_words" | "views" | "date_issued" = "title",
  sort_dir: "asc" | "desc" = "asc",
  date_issued_from?: string | null,
  date_issued_to?: string | null
): Promise<RecursosResponse> => {
  const params: any = {
    page,
    per_page,
    ...(repositorio_id?.length ? { repositorio_id } : {}),
    search_in,
    sort_by,
    sort_dir,
  };

  if (search) params.search = search;
  if (date_issued_from) params.date_issued_from = date_issued_from;
  if (date_issued_to) params.date_issued_to = date_issued_to;

  const { data } = await apiPublic.get<RecursosResponse>(`${API_BASE_URL}/x-meilisearch`, {
    params,
    headers: { "X-Skip-Auth": "1" },
    withCredentials: false,
  });

  return data;
};

export const getRecursosPublic = async (
  page = 1,
  per_page = 5,
  repositorio_id: number[] = [],
  search = "",
  search_in = "title",
  sort_by = "title",
  sort_dir = "asc"
) => {
  const params: any = { page, per_page, repositorio_id, search_in, sort_by, sort_dir };
  if (search) params.search = search;

  const { data } = await apiPublic.get<RecursosResponse>(`${API_BASE_URL}/recursos`, {
    params,
    headers: { "X-Skip-Auth": "1" },
    withCredentials: false,
  });
  return data;
};

export const getRecursoByIdPublic = async (id: number): Promise<RecursoDetalle> => {
  const { data } = await apiPublic.get<RecursoDetalle>(`/recursos/${id}`, {
    headers: { "X-Skip-Auth": "1" },
    withCredentials: false,
  });
  return data;
};