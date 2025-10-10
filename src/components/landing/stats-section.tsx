import { Card } from "@/components/ui/card"
import { BookOpen, Map, Database, Users, Eye, Download } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: BookOpen,
      value: "2,847",
      label: "Documentos de Investigación",
      color: "text-chart-1",
    },
    {
      icon: Map,
      value: "156",
      label: "Datos Geoespaciales",
      color: "text-chart-2",
    },
    {
      icon: Database,
      value: "89",
      label: "Datasets",
      color: "text-chart-3",
    },
    {
      icon: Users,
      value: "1,234",
      label: "Investigadores Activos",
      color: "text-chart-4",
    },
    {
      icon: Eye,
      value: "45,678",
      label: "Visualizaciones",
      color: "text-chart-5",
    },
    {
      icon: Download,
      value: "12,345",
      label: "Descargas",
      color: "text-secondary",
    },
  ]

  return (
    <section className="py-16 bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Estadísticas del Repositorio</h2>
          <p className="text-gray-500text-lg max-w-2xl mx-auto">
            Nuestra plataforma conecta investigadores con recursos académicos de alta calidad
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500text-balance">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
