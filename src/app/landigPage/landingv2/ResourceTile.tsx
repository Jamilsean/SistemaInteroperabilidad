"use client";
import { Link } from "react-router-dom";
import { ExternalLink, Eye, Database } from "lucide-react";
import type { Recurso } from "@/types/recursos";

const REPO_DATASET = 1; // <- si cambia, actualiza este valor

export function ResourceTile({ r }: { r: Recurso }) {
  const isDataset = r?.repositorio?.id === REPO_DATASET || r?.tipo_recurso?.nombre?.toUpperCase() === "DATASET";
  const hasImage = !!r.url_image && !isDataset; // normalmente datasets no traen portada
  const views = r.views ?? 0;

  return (
    <div className="group relative rounded-xl overflow-hidden border shadow-sm bg-card hover:shadow-md transition">
      <Link to={`/recursos/${r.id}`}>
        {hasImage ? (
          <img src={r.url_image!} alt={r.title} className="h-80 w-full" />
        ) : isDataset ? (
          // ====== Tarjeta visual especial para DATASETS sin imagen ======
          <div
            className="relative w-full h-72 md:h-80 lg:h-96"
            style={{
              background:
                "radial-gradient(60% 60% at 20% 10%, rgba(137,218,234,0.25) 0%, rgba(137,218,234,0) 60%), radial-gradient(50% 50% at 90% 80%, rgba(80,0,60,0.25) 0%, rgba(80,0,60,0) 60%), linear-gradient(135deg, #0ea5e9, #6366f1)",
            }}
          >
            {/* Patrón sutil en primer plano */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Contenido */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  <Database className="h-3.5 w-3.5" />
                  DATASET
                </span>
                {r.tipo_recurso?.nombre && r.tipo_recurso.nombre.toUpperCase() !== "DATASET" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                    {r.tipo_recurso.nombre}
                  </span>
                )}
              </div>

              <h3 className="text-white font-bold leading-tight line-clamp-3 text-xl md:text-2xl lg:text-3xl drop-shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                {r.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-white/90">
                <Eye className="h-4 w-4" />
                {views} vistas
              </div>
            </div>
          </div>
        ) : (
           <div
            className="relative w-full h-72 md:h-80 lg:h-96"
            style={{
              background:
                "radial-gradient(60% 60% at 20% 10%, rgba(137,218,234,0.25) 0%, rgba(137,218,234,0) 60%), radial-gradient(50% 50% at 90% 80%, rgba(80,0,60,0.25) 0%, rgba(80,0,60,0) 60%), linear-gradient(135deg, #0ea5e9, #6366f1)",
            }}
          >
            {/* Patrón sutil en primer plano */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Contenido */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  <Database className="h-3.5 w-3.5" />
                  DATASET
                </span>
                {r.tipo_recurso?.nombre && r.tipo_recurso.nombre.toUpperCase() !== "DATASET" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                    {r.tipo_recurso.nombre}
                  </span>
                )}
              </div>

              <h3 className="text-white font-bold leading-tight line-clamp-3 text-xl md:text-2xl lg:text-3xl drop-shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                {r.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-white/90">
                <Eye className="h-4 w-4" />
                {views} vistas
              </div>
            </div>
          </div>
        )}

        {/* Overlay al hover (solo cuando hay imagen) */}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-50 group-hover:opacity-100 transition" />
        )}

        {/* Texto sobre imagen (o sobre dataset ya tiene su propio layout) */}
        {hasImage && (
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="text-sm font-semibold line-clamp-2">{r.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
              <Eye className="h-4 w-4" />
              {views} vistas
            </div>
          </div>
        )}
      </Link>

      {/* Botón “Ver detalles” siempre visible */}
      <div className="absolute top-2 right-2">
        <Link
          to={`/recursos/${r.id}`}
          className="inline-flex items-center gap-1.5 text-xs bg-white/90 hover:bg-white rounded px-2 py-1 shadow-sm"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver detalles
        </Link>
      </div>
    </div>
  );
}
