export type Frecuencia = "diario" | "semanal" | "mensual" | string;

export interface HarvestTask {
  id: number;
  repositorio: string;
  frecuencia: Frecuencia;
  start_time: string;     
  repeat_every: number;   
  is_active: boolean;     
  created_at: string;
  updated_at: string;
}

// payload para actualizar
export interface UpdateHarvestTaskPayload {
  start_time: string;  
  repeat_every: number; 
}

// respuesta toggle (para activar o desactivar)
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
