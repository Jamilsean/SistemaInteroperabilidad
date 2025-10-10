export interface EnviarCorreosPayload {
  relacion_id: number;
  especialistas: number[]; // IDs de especialistas
}

// Respuesta genérica con mensaje
export interface ApiMessageResponse {
  message: string;
}

/* ---------- Votos / Aprobación ---------- */

// GET /v1/votos/{token}
export interface VotoDetalleResponse {
  relacion: {
    id: string;
    tipo: string;
    origen: string;
    persistent_uri_origen: string;
    url_image_origen: string;
    destino: string;
    persistent_uri_destino: string;
    url_image_destino: string;
    comentario: string;
  };
  aprobacion: {
    ya_voto: boolean;
    voto: string;          // e.g. "0" | "1" según tu backend
    justificacion: string; // texto ingresado por el especialista
  };
}

// POST /v1/votos/{token}
export interface RegistrarVotoPayload {
  voto: string;           // "0" / "1" (ajústalo a lo que tu API espere)
  justificacion: string;
}