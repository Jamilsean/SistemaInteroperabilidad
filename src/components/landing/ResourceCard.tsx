"use client";


import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, DownloadCloud, User2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Recurso } from "@/types/recursos";


type Props = {
  recurso: Recurso;
  // opcional: mapear id de tipo → chip
  tipoLabel?: string; // p.ej. "Tesis", "Artículo"
  onDownload?: (r: Recurso) => void;
};

export function ResourceCard({ recurso, tipoLabel, onDownload }: Props) {
  return (
    <Card className="p-4 lg:p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {recurso.url_image ? (
            <img
              src={recurso.url_image}
              alt={recurso.title}
              className="h-12 w-12 rounded-lg object-cover ring-1 ring-muted"
            />
          ) : (
            <div className="h-12 w-12 grid place-items-center rounded-lg bg-muted/40">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-semibold tracking-tight leading-6 flex-1">
              {recurso.title}
            </h3>
            {tipoLabel && (
              <Badge variant="outline" className="shrink-0">
                {tipoLabel}
              </Badge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {recurso.autores && (
              <span className="inline-flex items-center gap-1">
                <User2 className="h-4 w-4" />
                {recurso.autores}
              </span>
            )}
            {/* Si tu backend no trae año directo, puedes intentar derivearlo desde raw_metadata.date, aquí lo omitimos */}
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {recurso.views} vistas
            </span>
          </div>

          {recurso.abstract && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {recurso.abstract}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to={`/recursos/${recurso.id}`} className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver detalles
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => onDownload?.(recurso)}
              disabled={!recurso.persistent_uri}
              title={!recurso.persistent_uri ? "No disponible" : "Descargar"}
            >
              <DownloadCloud className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}