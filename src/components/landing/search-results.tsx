import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, Calendar, User } from "lucide-react"

const mockResults = [
  {
    id: 1,
    title: "Análisis del impacto de la inteligencia artificial en la educación superior",
    author: "María González Pérez",
    year: 2024,
    type: "Tesis",
    faculty: "Ingeniería",
    abstract:
      "Este estudio examina cómo la IA está transformando los métodos de enseñanza y aprendizaje en universidades...",
    downloads: 245,
  },
  {
    id: 2,
    title: "Desarrollo sostenible y políticas ambientales en América Latina",
    author: "Carlos Rodríguez Silva",
    year: 2023,
    type: "Informe",
    faculty: "Economía",
    abstract:
      "Análisis comparativo de las políticas ambientales implementadas en diferentes países latinoamericanos...",
    downloads: 189,
  },
  {
    id: 3,
    title: "Innovaciones en telemedicina: Casos de éxito durante la pandemia",
    author: "Ana Martínez López",
    year: 2023,
    type: "Artículo",
    faculty: "Medicina",
    abstract: "Estudio de casos sobre la implementación exitosa de sistemas de telemedicina en hospitales públicos...",
    downloads: 312,
  },
]

export function SearchResults() {
  return (
    <div className="max-w-4xl mx-auto mt-20 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">3</span> de{" "}
          <span className="font-semibold text-foreground">1,247</span> resultados
        </p>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar resultados
        </Button>
      </div>

      {mockResults.map((result) => (
        <Card key={result.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer text-balance">
                  {result.title}
                </h3>
                <Badge variant="secondary" className="flex-shrink-0">
                  {result.type}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {result.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {result.year}
                </span>
                <span>{result.faculty}</span>
                <span>{result.downloads} descargas</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{result.abstract}</p>

              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver detalles
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-center pt-8">
        <Button variant="outline" size="lg">
          Cargar más resultados
        </Button>
      </div>
    </div>
  )
}
