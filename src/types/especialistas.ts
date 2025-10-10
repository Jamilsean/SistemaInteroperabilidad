export interface Especialista {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  created_at: string;
  updated_at: string;
  aprobaciones: any[]; // Reemplaza cuando conozcas el shape real
}

export interface LaravelLink {
  url: string | null;
  label: string;
  active: boolean;
}

/** Respuesta de listado con paginación estilo Laravel */
export interface EspecialistaListResponse {
  current_page: number;
  data: Especialista[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: LaravelLink[];
  next_page_url: string | null;
  path: string;
  per_page: number | string;
  prev_page_url: string | null;
  to: number | null;
  total: number | string;
}

/** Payload para crear/actualizar */
export interface EspecialistaUpsertPayload {
  nombres: string;
  apellidos: string;
  email: string;
}

/** Respuestas de acciones */
export interface CreateEspecialistaResponse {
  message: string;                       // "Especialista creado correctamente."
  // En tu ejemplo viene como "string"; dejamos union por resiliencia
  especialista: Especialista | string;
}

export interface UpdateEspecialistaResponse {
  message: string;                       // "Especialista actualizado correctamente."
}

export interface DeleteEspecialistaResponse {
  message: string;                       // "Registro eliminado correctamente."
}