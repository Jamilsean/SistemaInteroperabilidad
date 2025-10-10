// src/types/harvests.ts
export interface Repositorio {
  id: number;
  nombre: string;
  base_url: string;
  is_harvesting: boolean;
  created_at: string;
  updated_at: string;
  recursos_count?: number;
}

// Si aún no conoces el shape de los detalles, usa un índice flexible:
export interface HarvestDetail {
  [key: string]: unknown;
}

export interface Harvest {
  id: number;
  started_at: string;
  finished_at: string;
  error: string | null;
  total_records: number;
  updated_records: number;
  new_records: number;
  repositorio_id: number;
  created_at: string | null;
  updated_at: string | null;
  repositorio: Repositorio;
  harvest_details: HarvestDetail[]; // 👈 que coincida en todos lados
}
export interface LaravelLink {
  url: string | null;
  label: string;
  active: boolean;
}

// export interface HarvestsResponse {
//   cantidad: number;
//   harvests: Harvest[];
// }
export interface HarvestsResponse{
  current_page: number;
  data: Harvest[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: LaravelLink[];
  next_page_url: string | null;
  path: string;
  per_page: number | string; // a veces llega como string
  prev_page_url: string | null;
  to: number | null;
  total: number | string;    // a veces llega como string
}