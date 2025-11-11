import { API_BASE_URL } from "@/config/env";
import api from "@/lib/api";

import type { CreateEspecialistaResponse, DeleteEspecialistaResponse, Especialista, EspecialistaListResponse, EspecialistaUpsertPayload, UpdateEspecialistaResponse } from "@/types/especialistas";

/** Filtros/orden para GET /v1/especialista */
export type GetEspecialistasParams = {
  page?: number | null;       
  per_page?: number | null;   
  search?: string | null;      
  search_in?: "nombres" | "apellidos" | "email"; 
  sort_by?: "nombres" | "apellidos" | "email" | "created_at" | "updated_at";
  sort_dir?: "asc" | "desc";
};

/** Listado con paginación */
export async function getEspecialistas(
  params: GetEspecialistasParams = {}
): Promise<EspecialistaListResponse> {
  const { data } = await api.get<EspecialistaListResponse>(
    `${API_BASE_URL}/especialista`,
    { params }
  );
  return data;
}

/** (Opcional) Obtener por ID si tu backend lo expone en GET /v1/especialista/:id */
export async function getEspecialistaById(id: number): Promise<Especialista> {
  const { data } = await api.get<Especialista>(`${API_BASE_URL}/especialista/${id}`);
  return data;
}

/** Crear especialista (POST /v1/especialista) */
export async function createEspecialista(
  payload: EspecialistaUpsertPayload
): Promise<CreateEspecialistaResponse> {
  const { data } = await api.post<CreateEspecialistaResponse>(
    `${API_BASE_URL}/especialista`,
    payload
  );
  return data;
}

/** Actualizar especialista (PUT /v1/especialista/:id) */
export async function updateEspecialista(
  id: number,
  payload: EspecialistaUpsertPayload
): Promise<UpdateEspecialistaResponse> {
  const { data } = await api.put<UpdateEspecialistaResponse>(
    `${API_BASE_URL}/especialista/${id}`,
    payload
  );
  return data;
}

/** Eliminar especialista (DELETE /v1/especialista/:id) */
export async function deleteEspecialista(
  id: number
): Promise<DeleteEspecialistaResponse> {
  const { data } = await api.delete<DeleteEspecialistaResponse>(
    `${API_BASE_URL}/especialista/${id}`
  );
  return data;
}