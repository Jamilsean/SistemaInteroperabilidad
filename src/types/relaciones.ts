import type { Recurso } from "./recursos";

export interface Relacion {
  id: number;
  tipo_relacion: string;
  confianza: string;
  metodo_vinculacion: string;
  recurso_origen_id: number;
  recurso_destino_id: number;
  comentario: string | null;
  esta_aprobada: string | null;
  created_at: string;
  updated_at: string;
  recurso_origen: Recurso;
  recurso_destino: Recurso;
  aprobaciones: number[];

  // uri_origen: string;
  // title_origen: string;
  // repo_nombre_origen: string;
  // tipo_recurso_origen: string;

  // uri_destino: string;
  // title_destino: string;
  // repo_nombre_destino: string;
  // tipo_recurso_destino: string;
}

export interface RelacionesResponse {
  current_page: number;
  data: Relacion[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
export type CrearRelacionPayload = {
  recurso_origen_id: number;
  tipo_relacion: string;
  recurso_destino_id: number;
  comentario: string;
};
export interface CrearRelacionResponse {
  message: string;
  data: {
    id: number;
    tipo_relacion: string;
    confianza: number;
    metodo_vinculacion: string;
    recurso_origen_id: number;
    recurso_destino_id: number;
    comentario: string;
    created_at: string;
    updated_at: string;
  };
}
export type EliminarRelacionResponse = {
  message: string; 
};
