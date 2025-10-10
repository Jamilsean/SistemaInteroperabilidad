export interface TipoRecurso {
  id: number
  nombre: string
  description: string
  icon: string
  created_at: string
  updated_at: string
}

export interface TiposRecursoResponse {
  repositorios: TipoRecurso[]
}