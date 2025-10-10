// src/types/recursos.ts
import type { Repositorios } from "./repositorios";
import type { TipoRecurso } from "./tipoRecurso";

// Utilidades
type StrOrStrArr = string | string[];

// Enlaces de paginación Laravel
export interface LaravelLink {
  url: string | null;
  label: string;   
  active: boolean;
}

// Variante GeoNetwork
export interface OwsBoundingBox {
  "@crs"?: string;
  "ows:LowerCorner"?: string;
  "ows:UpperCorner"?: string;
}

export type DcUri =
  | {
      "@protocol"?: string;
      "@name"?: string;
      "@description"?: string;
      "#text"?: string;
    }
  | string;  

// raw_metadata: combina claves GeoNetwork (dc:*, ows:*) y Dataverse (sin prefijo)
export interface RawMetadata {
  // Namespaces GeoNetwork
  "@xmlns:gmx"?: string;
  "@xmlns:dc"?: string;
  "@xmlns:ows"?: string;
  "@xmlns:dct"?: string;
  "@xmlns:geonet"?: string;

  // GeoNetwork
  "dc:identifier"?: StrOrStrArr;
  "dc:date"?: StrOrStrArr;
  "dc:title"?: StrOrStrArr;
  "dc:subject"?: StrOrStrArr;
  "dc:format"?: StrOrStrArr;
  "dct:abstract"?: string;
  "dc:description"?: string;
  "dc:rights"?: StrOrStrArr;
  "dc:language"?: StrOrStrArr | string;
  "dc:source"?: string | null;
  "ows:BoundingBox"?: OwsBoundingBox;
  "dc:URI"?: DcUri[];

  // Dataverse
  title?: StrOrStrArr;
  identifier?: StrOrStrArr;
  creator?: StrOrStrArr;
  publisher?: StrOrStrArr;
  description?: StrOrStrArr;
  subject?: StrOrStrArr;
  date?: StrOrStrArr;
  contributor?: StrOrStrArr;
  type?: StrOrStrArr;
  language?: StrOrStrArr;

  // Permite campos adicionales no modelados
  [k: string]: unknown;
}

export interface Recurso {
  id: number;
  persistent_uri: string;
  native_id: string;              
  url_image: string | null;         
  title: string;
  autores: string | null;          
  abstract: string;
  key_words: string;
  views: number;
  repositorio_id: number;
  tipo_recurso_id: number;
  is_active: boolean;
  raw_metadata: RawMetadata;
  created_at: string;               
  updated_at: string;               
  repositorio: Repositorios;
  tipo_recurso: TipoRecurso;
}

export interface RecursosResponse {
  current_page: number;
  data: Recurso[];
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
export interface RecursoDetalle {
  id: number;
  persistent_uri: string;
  native_id: string;              
  url_image: string | null;         
  title: string;
  autores: string | null;          
  abstract: string;
  key_words: string;
  views: number;
  repositorio_id: number;
  tipo_recurso_id: number;
  is_active: boolean;
  raw_metadata: RawMetadata;
  created_at: string;               
  updated_at: string;               
  repositorio: Repositorios;
  tipo_recurso: TipoRecurso;
  relaciones_origen: Recurso[];  
  relaciones_destino: Recurso[]; 
}