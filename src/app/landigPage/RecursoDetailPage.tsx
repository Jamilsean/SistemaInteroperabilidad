"use client";

import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { RecursoDetalle } from "@/types/recursos";
import { parseAxiosError } from "@/lib/http-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Link as LinkIcon, Eye, ChevronDown, ChevronUp,
  Merge,
} from "lucide-react";
import { getRecursoById } from "@/services/recursosService";

/** Helpers */
function splitKeywords(kw?: string | null): string[] {
  if (!kw) return [];
  return kw
    .split(/[;,|]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12); // limita visualmente
}

function listFromHtml(html?: string | null): string[] {
  if (!html) return [];
  // 1) extrae <li> ... </li>
  const matches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m =>
    m[1]
      .replace(/<[^>]+>/g, " ")      // quita etiquetas internas
      .replace(/\s+/g, " ")          // compácta espacios
      .trim()
  );
  if (matches.length) return matches;
  // 2) si no hay <li>, retorna el texto plano
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain ? [plain] : [];
}

function short(text?: string | null, len = 220): string {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > len ? t.slice(0, len - 1) + "…" : t;
}

export default function RecursoDetailPage() {
  const { id } = useParams();
  const rid = Number(id);
  const navigate = useNavigate();

  const [data, setData] = React.useState<RecursoDetalle | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showMeta, setShowMeta] = React.useState(false);

  React.useEffect(() => {
    if (!rid) return;
    (async () => {
      setLoading(true);
      try {
        const r = await getRecursoById(rid);
        setData(r);
      } catch (e: any) {
        const err = parseAxiosError(e);
        toast.error(err.message || "No se pudo cargar el recurso");
      } finally {
        setLoading(false);
      }
    })();
  }, [rid]);

  if (loading) return <div className="container mx-auto px-4 lg:px-8 py-10">Cargando…</div>;
  if (!data) return <div className="container mx-auto px-4 lg:px-8 py-10">No encontrado.</div>;

  // Aplana relaciones (el backend devuelve objetos de relación)
  const origenRecursos =
    (data.relaciones_origen ?? [])
      .map((rel: any) => rel?.recurso_destino)
      .filter((x: any) => x && typeof x.id === "number");

  const destinoRecursos =
    (data.relaciones_destino ?? [])
      .map((rel: any) => rel?.recurso_origen)
      .filter((x: any) => x && typeof x.id === "number");

  const kw = splitKeywords(data.key_words);
  const abstractList = listFromHtml(data.abstract);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link to="/landingpage">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {data.persistent_uri && (
            <Button variant="outline" asChild>
              <a href={data.persistent_uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Enlace origen
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Cabecera del recurso */}
      <Card className="p-6 rounded-2xl border-blue-100">
        <div className="flex gap-5">
          <div className="shrink-0">
            {data.url_image ? (
              <img
                src={data.url_image}
                alt={data.title}
                className="w-24 h-24 object-cover rounded-xl ring-1 ring-muted"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-blue-50/60 grid place-items-center text-blue-700 font-semibold">
                {data.tipo_recurso?.nombre?.slice(0, 1) ?? "R"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h1 className="text-2xl font-bold leading-7">{data.title}</h1>
              {data.tipo_recurso?.nombre && (
                <Badge variant="outline" className="ml-auto">{data.tipo_recurso.nombre}</Badge>
              )}
            </div>

            <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
              {data.autores && <span className="truncate max-w-[60ch]">{data.autores}</span>}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {data.views} vistas
              </span>
              {data.repositorio?.nombre && (
                <span className="inline-flex items-center gap-1">
                  • {data.repositorio.nombre}
                </span>
              )}
            </div>

            {/* Resumen: si viene en <ul><li>, mostrar lista; si no, párrafo */}
            <div className="mt-4">
              {abstractList.length > 1 ? (
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {abstractList.map((li, i) => <li key={i}>{li}</li>)}
                </ul>
              ) : (
                data.abstract && <p className="text-muted-foreground whitespace-pre-line">{data.abstract}</p>
              )}
            </div>

            {/* Palabras clave */}
            {!!kw.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {kw.map((k, i) => (
                  <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-800 border-blue-100">
                    {k}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadatos (toggle) */}
            <div className="mt-5">
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => setShowMeta((v) => !v)}
              >
                {showMeta ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                {showMeta ? "Ocultar metadatos" : "Ver metadatos"}
              </Button>

              {showMeta && (
                <div className="mt-4 grid gap-3 rounded-lg border bg-muted/30 p-4">
                  {Object.entries(data.raw_metadata || {}).map(([k, v]) => (
                    <div key={k} className="grid sm:grid-cols-4 gap-2 items-start">
                      <div className="text-sm font-medium text-muted-foreground sm:pt-1">{k}</div>
                      <div className="sm:col-span-3 text-sm">
                        {Array.isArray(v) ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {v.map((it, i) => <li key={i}>{String(it)}</li>)}
                          </ul>
                        ) : (
                          <span>{String(v)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Relaciones */}
      {(origenRecursos.length || destinoRecursos.length) ? (
        <div className="grid px-20 gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Merge className="h-5 w-5 text-blue-600" />
            
            Relaciones
          </h2>

          {/* Recursos que referencian a este (origen → este) */}
          {!!origenRecursos.length && (
            <Card className="p-4 border-emerald-100">
              <div className="font-medium mb-3">Recursos que referencian a este</div>
              <ul className="grid gap-3">
                {origenRecursos.map((r: any) => {
                  const kwR = splitKeywords(r.key_words);
                  const absR = listFromHtml(r.abstract);
                  return (
                    <li key={r.id} className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-emerald-50/40">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/recursos/${r.id}`} className="font-medium hover:underline truncate">
                          {r.title}
                        </Link>
                        <div className="flex items-center gap-2">
                          {r.tipo_recurso?.nombre && (
                            <Badge variant="outline">{r.tipo_recurso.nombre}</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/recursos/${r.id}`)}
                          >
                            Ver recurso
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        {r.autores && <span className="truncate max-w-[54ch]">{r.autores}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {r.views ?? 0} vistas
                        </span>
                      </div>

                      {/* Resumen breve */}
                      {!!absR.length && (
                        <div className="text-sm text-muted-foreground">
                          {absR.length > 1 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {absR.slice(0, 4).map((li, i) => <li key={i}>{li}</li>)}
                            </ul>
                          ) : (
                            <p>{short(absR[0], 220)}</p>
                          )}
                        </div>
                      )}

                      {/* Palabras clave */}
                      {!!kwR.length && (
                        <div className="flex flex-wrap gap-1.5">
                          {kwR.slice(0, 8).map((k: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-100">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Recursos referenciados por este (este → destino) */}
          {!!destinoRecursos.length && (
            <Card className="p-4 border-purple-100">
              <div className="font-medium mb-3">Recursos referenciados por este</div>
              <ul className="grid px-20 gap-3">
                {destinoRecursos.map((r: any) => {
                  const kwR = splitKeywords(r.key_words);
                  const absR = listFromHtml(r.abstract);
                  return (
                    <li key={r.id} className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-purple-50/40">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/recursos/${r.id}`} className="font-medium hover:underline truncate">
                          {r.title}
                        </Link>
                        <div className="flex items-center gap-2">
                          {r.tipo_recurso?.nombre && (
                            <Badge variant="outline">{r.tipo_recurso.nombre}</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/recursos/${r.id}`)}
                          >
                            Ver recurso
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        {r.autores && <span className="truncate max-w-[54ch]">{r.autores}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {r.views ?? 0} vistas
                        </span>
                      </div>

                      {!!absR.length && (
                        <div className="text-sm text-muted-foreground">
                          {absR.length > 1 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {absR.slice(0, 4).map((li, i) => <li key={i}>{li}</li>)}
                            </ul>
                          ) : (
                            <p>{short(absR[0], 220)}</p>
                          )}
                        </div>
                      )}

                      {!!kwR.length && (
                        <div className="flex flex-wrap gap-1.5">
                          {kwR.slice(0, 8).map((k: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-800 border-purple-100">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          Este recurso no tiene relaciones registradas.
        </Card>
      )}
    </div>
  );
}
