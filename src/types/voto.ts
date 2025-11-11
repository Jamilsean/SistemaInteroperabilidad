export interface EnviarCorreosPayload {
  relacion_id: number;
  especialistas: number[]; 
}

// Respuesta genérica 
export interface ApiMessageResponse {
  message: string;
}

/* ---------- Votos / Aprobación ---------- */

// GET /{token}
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
    voto: string;         
    justificacion: string; 
  };
}

// POST /{token}
export interface RegistrarVotoPayload {
  voto: string;         
  justificacion: string;
}