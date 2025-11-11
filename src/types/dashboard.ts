export interface RecursoBasico {
id: number;
persistent_uri: string | null;
native_id: string | null;
url_image: string | null;
title: string;
autores: string | null;
abstract: string | null;
key_words?: string | null;
views: number;
repositorio_id: number;
tipo_recurso_id: number;
is_active: boolean;
raw_metadata?: Record<string, any>;
created_at: string;
updated_at: string;
}
export interface DashboardRepositorio {
id: number;
nombre: string; 
base_url: string;
is_harvesting: boolean;
created_at: string;
updated_at: string;
recursos_count: number;
ultimo_recurso: RecursoBasico | null;
}
export interface CosechaItem {
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
repositorio: {
id: number;
nombre: string;
base_url: string;
is_harvesting: boolean;
created_at: string;
updated_at: string;
};
}
export interface CosechasResumen {
total_cosechas: number;
total_cosechas_exitosas: number;
total_cosechas_error: number;
ultimas_cosechas: {
max_count: number;
data: CosechaItem[];
};
}
export interface DashboardResponse {
repositorios: DashboardRepositorio[];
cosechas: CosechasResumen;
}