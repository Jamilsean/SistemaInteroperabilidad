export interface Repositorios {
  id: number
  nombre: string
  base_url: string
  is_harvesting: string
  created_at: string
  updated_at: string
  recursos_count: number
}

export interface RepositoriosResponse {
  repositorios: Repositorios[]
}
