 
 import type { TipoRecurso, TiposRecursoResponse } from "@/types/tipoRecurso";
import api from "@/lib/api"
import { API_BASE_URL } from "@/config/env";


 
export const listTiposRepositorios = async (): Promise<TipoRecurso[]> => {
   const { data } = await api.get<TiposRecursoResponse>(`${API_BASE_URL}/tipos-recurso`);
  return data.repositorios;
} 