// src/services/recursosService.ts
 import { API_BASE_URL } from "@/config/env"
import { api } from "@/lib/api"
import type { Repositorios, RepositoriosResponse } from "@/types/repositorios"


export const listRepositorios = async (): Promise<Repositorios[]> => {
  const { data } = await api.get<RepositoriosResponse>(`${API_BASE_URL}/repositorios`)
  return data.repositorios
}
