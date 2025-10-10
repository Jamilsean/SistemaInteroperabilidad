"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function AdvancedSearch() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Autor</Label>
          <Input id="author" placeholder="Nombre del autor" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Año de publicación</Label>
          <div className="flex gap-2">
            <Input id="year" type="number" placeholder="Desde" />
            <Input type="number" placeholder="Hasta" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de documento</Label>
          <Select>
            <SelectTrigger id="type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="thesis">Tesis</SelectItem>
              <SelectItem value="report">Informe</SelectItem>
              <SelectItem value="article">Artículo</SelectItem>
              <SelectItem value="book">Libro</SelectItem>
              <SelectItem value="conference">Conferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faculty">Facultad</Label>
          <Select>
            <SelectTrigger id="faculty">
              <SelectValue placeholder="Seleccionar facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="engineering">Ingeniería</SelectItem>
              <SelectItem value="medicine">Medicina</SelectItem>
              <SelectItem value="law">Derecho</SelectItem>
              <SelectItem value="economics">Economía</SelectItem>
              <SelectItem value="education">Educación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="advisor">Asesor</Label>
          <Input id="advisor" placeholder="Nombre del asesor" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Palabras clave</Label>
          <Input id="keywords" placeholder="Separadas por comas" />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline">Limpiar filtros</Button>
        <Button>Aplicar filtros</Button>
      </div>
    </div>
  )
}
