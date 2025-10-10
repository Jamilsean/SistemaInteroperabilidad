"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { toast } from "sonner";


import type { Recurso, RecursosResponse } from "@/types/recursos";

import { parseAxiosError } from "@/lib/http-error";
import { getRecursos } from "@/services/recursosService";
import { ResourceCard } from "./ResourceCard";

// pequeño debounce
function useDebounced<T>(value: T, delay = 400) {
  const [deb, setDeb] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

export function SearchSection() {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // filtros
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, 500);

  const [page, setPage] = React.useState(1);
  const [perPage,] = React.useState(10);

  // search_in: title,autores,abstract,key_words
  const [searchIn, setSearchIn] = React.useState<"title" | "autores" | "abstract" | "key_words">("title");

  // sort_by: title | autores | abstract | key_words | views
  const [sortBy, setSortBy] = React.useState<"title" | "autores" | "abstract" | "key_words" | "views">("title");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  // repositorio: si seleccionas uno o más, envía array; si es “Todos”, no envíes el parámetro
  const [repositorioIds, setRepositorioIds] = React.useState<number[]>([]);

  // datos
  const [rows, setRows] = React.useState<Recurso[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [lastPage, setLastPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async (p = 1) => {
    // validación mínima: el backend pide >= 2 caracteres si envías search
    if (debouncedSearch && debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 2) return;

    setLoading(true);
    try {
      const res: RecursosResponse = await getRecursos(
        p,
        perPage,
        repositorioIds.length ? repositorioIds : [],      // si vacío, no envía el param desde el servicio
        debouncedSearch.trim(),
        searchIn,
        sortBy,
        sortDir
      );
      setRows(res.data);
      setTotal(Number(res.total ?? res.data.length));
      setLastPage(res.last_page ?? 1);
      setPage(res.current_page ?? p);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar recursos");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, perPage, repositorioIds, searchIn, sortBy, sortDir]);

  // dispara cuando cambie el texto (debounced) o filtros
  React.useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleNext = () => page < lastPage && fetchData(page + 1);
  const handlePrev = () => page > 1 && fetchData(page - 1);

  const handleDownload = (r: Recurso) => {
    if (!r.persistent_uri) {
      toast.info("Este recurso no tiene URL pública para descargar.");
      return;
    }
    window.open(r.persistent_uri, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-10 lg:py-8" id="buscar">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="p-4 lg:p-6 shadow-sm rounded-2xl">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por título, autor, tema, palabras clave…"
                  className="pl-10 h-11 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="lg" className="px-6" onClick={() => fetchData(1)} disabled={loading}>
                {loading ? "Buscando…" : "Buscar"}
              </Button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showAdvanced ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Ocultar filtros
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Presiona</span>
                <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">Enter</kbd>
                <span>para buscar</span>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Buscar en */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Buscar en</div>
                  <Select value={searchIn} onValueChange={(v) => setSearchIn(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Campo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="autores">autores</SelectItem>
                      <SelectItem value="abstract">Resumen</SelectItem>
                      <SelectItem value="key_words">Palabras clave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar por */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ordenar por</div>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Campo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="autores">Autores</SelectItem>
                      <SelectItem value="abstract">Resumen</SelectItem>
                      <SelectItem value="key_words">Palabras clave</SelectItem>
                      <SelectItem value="views">Vistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dirección */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Dirección</div>
                  <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                    <SelectTrigger><SelectValue placeholder="asc/desc" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascendente</SelectItem>
                      <SelectItem value="desc">Descendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Repositorio (demo simple: selección única) */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Repositorio</div>
                  <Select
                    value={String(repositorioIds[0] ?? "all")}
                    onValueChange={(v) => setRepositorioIds(v === "all" ? [] : [Number(v)])}
                  >
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {/* si tienes catálogo, poblarlo dinámicamente */}
                      <SelectItem value="1">Datasets</SelectItem>
                      <SelectItem value="2">Documentos</SelectItem>
                      <SelectItem value="3">Mapas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Resultados */}
        <div className="max-w-5xl mx-auto space-y-3">
          {rows.map((r) => (
            <ResourceCard
              key={r.id}
              recurso={r}
              tipoLabel={undefined /* si quieres mapear por r.tipo_recurso_id */}
              onDownload={handleDownload}
            />
          ))}

          {!loading && rows.length === 0 && (
            <div className="text-center text-muted-foreground py-16">Sin resultados</div>
          )}

          {loading && (
            <div className="text-center text-muted-foreground py-12">Buscando…</div>
          )}

          {lastPage > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {page} de {lastPage} • {total} resultados
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); handlePrev(); }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleNext(); }}
                      className={page === lastPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
