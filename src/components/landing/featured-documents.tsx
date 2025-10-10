import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, ExternalLink, Calendar, User, MapPin, Database } from "lucide-react"

export function FeaturedDocuments() {
  const documents = [
    {
      id: 1,
      title: "Análisis del Retroceso de Glaciares por Desprendimiento de Glaciar y Roca del Nevado Huascarán Sur",
      authors: ["Dr. María González", "Dr. Carlos Rodríguez"],
      abstract:
        "Este estudio examina los procesos de desprendimiento glaciar y su impacto en el retroceso de los glaciares del Nevado Huascarán Sur, utilizando técnicas de teledetección y análisis geoespacial para evaluar los cambios temporales...",
      date: "2023-07",
      views: 1247,
      downloads: 89,
      uri: "hdl.handle.net/20.500.12816/5234",
      image: "/glacier-mountain-research.jpg",
      tags: ["Glaciares", "Cambio Climático", "Teledetección"],
      relatedData: {
        geospatial: 4,
        datasets: 2,
      },
    },
    {
      id: 2,
      title: "Limnología: Evidencia Científica para la Acción en Ecosistemas Acuáticos Altoandinos",
      authors: ["Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña"],
      abstract:
        "La limnología de alta montaña presenta características únicas que requieren enfoques especializados. Este documento analiza la evidencia científica disponible para la conservación y manejo de ecosistemas acuáticos altoandinos...",
      date: "2023-09",
      views: 892,
      downloads: 156,
      uri: "hdl.handle.net/20.500.12816/5891",
      image: "/mountain-lake-ecosystem.jpg",
      tags: ["Limnología", "Ecosistemas", "Alta Montaña"],
      relatedData: {
        geospatial: 6,
        datasets: 3,
      },
    },
    {
      id: 3,
      title: "Monitoreo de Biodiversidad en Humedales Altoandinos mediante Sensores Remotos",
      authors: ["Dra. Ana Martínez", "Dr. Luis Fernández", "MSc. Carmen Silva"],
      abstract:
        "Implementación de metodologías de monitoreo de biodiversidad utilizando tecnologías de sensores remotos para evaluar el estado de conservación de humedales altoandinos y su respuesta al cambio climático...",
      date: "2024-01",
      views: 634,
      downloads: 78,
      uri: "hdl.handle.net/20.500.12816/6012",
      image: "/wetland-biodiversity-monitoring.jpg",
      tags: ["Biodiversidad", "Humedales", "Sensores Remotos"],
      relatedData: {
        geospatial: 8,
        datasets: 5,
      },
    },
  ]

  return (
    <section className="py-16 bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Documentos Destacados</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Explora las investigaciones más relevantes y recientes en nuestro repositorio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Document Image */}
              <div className="relative h-48 overflow-hidden">
                <img src={doc.image || "/placeholder.svg"} alt={doc.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-background/90">
                    Destacado
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                {/* Title */}
                <h3 className="font-bold text-lg mb-3 text-balance leading-tight">{doc.title}</h3>

                {/* Authors */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-pretty">{doc.authors.join(", ")}</span>
                </div>

                {/* Abstract */}
                <p className="text-sm text-gray-500 mb-4 text-pretty line-clamp-3">{doc.abstract}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Fecha: {doc.date}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{doc.views}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        <span>{doc.downloads}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono bg-muted/50 p-2 rounded">URI: {doc.uri}</div>
                </div>

                {/* Related Data */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{doc.relatedData.geospatial} datos geoespaciales</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Database className="h-4 w-4 mr-1" />
                      <span>{doc.relatedData.datasets} datasets</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver más
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Todos los Documentos
          </Button>
        </div>
      </div>
    </section>
  )
}
