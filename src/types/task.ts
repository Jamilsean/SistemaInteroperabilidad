export type Frecuencia = "diario" | "semanal" | "mensual" | string;

export interface HarvestTask {
  id: number;
  repositorio: string;
  frecuencia: Frecuencia;
  start_time: string;      // viene como "YYYY-MM-DD HH:mm:ss"
  repeat_every: number;    // días entre ejecuciones
  is_active: boolean;      // normalizamos a boolean en el servicio
  created_at: string;
  updated_at: string;
}

// payload para actualizar
export interface UpdateHarvestTaskPayload {
  start_time: string;   // ISO ej. "2019-08-24T14:15:22Z"
  repeat_every: number; // días
}

// respuesta toggle (la API puede devolver is_active como string)
export interface ToggleTaskResponseRaw {
  id: number;
  repositorio: string;
  frecuencia: string;
  start_time: string;
  repeat_every: number;
  is_active: boolean | "0" | "1" | "true" | "false";
  created_at: string;
  updated_at: string;
}
