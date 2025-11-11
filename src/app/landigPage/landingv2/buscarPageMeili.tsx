"use client";
import * as React from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getRecursosWithMeilisearch } from "@/services/recursosService";
import type { Recurso, RecursosResponse } from "@/types/recursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import TopNav from "../landingv3/TopNav";
import { ResourceTile } from "./ResourceTile";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { Loader2 } from "lucide-react";
import { allowOnlyMark } from "@/types/autocomplete";

const REPO_DATASET = 1;
const REPO_DOCUMENTO = 2;
const REPO_MAPA = 3;
const DOC_ROUTE_BASE = "/recursos";

// util mínima de validación YYYY-MM
const isYYYYMM = (v: string) => /^\d{4}-\d{2}$/.test(v);
const cmpYM = (a: string, b: string) => a.localeCompare(b); // YYYY-MM se compara lexicográficamente

export default function BuscarPageMeili() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [page, setPage] = React.useState(Number(params.get("page") || 1));
  const [perPage] = React.useState(12);

  const [search, setSearch] = React.useState(params.get("search") || "");
  const [searchIn, setSearchIn] = React.useState<"title" | "autores" | "abstract" | "key_words">(
    (params.get("search_in") as any) || "title"
  );

  const [sortBy, setSortBy] = React.useState<"title" | "autores" | "abstract" | "key_words" | "views" | "date_issued">(
    ((params.get("sort_by") as any) || "views") as any
  );
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">((params.get("sort_dir") as any) || "desc");

  const [repoId, setRepoId] = React.useState<number | null>(
    params.get("repositorio_id") ? Number(params.get("repositorio_id")) : null
  );
  
    // autocomplete
    const { items: suggestions, open, setOpen, loading } = useAutocomplete(search, 8);
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);
    const listRef = React.useRef<HTMLDivElement | null>(null);
    // const inputRef = React.useRef<HTMLInputElement | null>(null);
  

   const [dateFrom, setDateFrom] = React.useState<string>(params.get("date_issued_from") || "");
  const [dateTo, setDateTo] = React.useState<string>(params.get("date_issued_to") || "");

  const [rows, setRows] = React.useState<Recurso[]>([]);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [, setLoading] = React.useState(false);

  const syncURL = (p = page) => {
    const q = new URLSearchParams();
    if (search.trim()) q.set("search", search.trim());
    q.set("search_in", searchIn);
    q.set("sort_by", sortBy);
    q.set("sort_dir", sortDir);
    if (repoId) q.set("repositorio_id", String(repoId));
    if (isYYYYMM(dateFrom)) q.set("date_issued_from", dateFrom);
    if (isYYYYMM(dateTo)) q.set("date_issued_to", dateTo);
    q.set("page", String(p));
    setParams(q, { replace: true });
  };

  const validateDates = () => {
    if (dateFrom && !isYYYYMM(dateFrom)) return toast("Fecha 'Desde' inválida (formato AAAA-MM).");
    if (dateTo && !isYYYYMM(dateTo)) return toast("Fecha 'Hasta' inválida (formato AAAA-MM).");
    if (dateFrom && dateTo && cmpYM(dateFrom, dateTo) > 0) return toast("'Fecha Fin' no puede ser menor que Fecha Inicio.");
    return null;
  };

  const fetchData = React.useCallback(
    async (p = 1) => {
      // Validación de fechas
      const err = validateDates();
      if (err) {
        // toast(err); // si prefieres: toast.error(err)
        return;
      }

      setLoading(true);
      try {
        const repoArray = repoId ? [repoId] : [];
 
        const res: RecursosResponse = await getRecursosWithMeilisearch(
          p,
          perPage,
          repoArray,
          search.trim(),
          searchIn,
          sortBy,
          sortDir,
           dateFrom || null,
          dateTo || null
        );

        setRows(res.data);
        setLastPage(res.last_page || 1);
        setTotal(Number(res.total || res.data.length || 0));
        setPage(res.current_page || p);
        syncURL(res.current_page || p);
      } finally {
        setLoading(false);
      }
    },
    [search, searchIn, sortBy, sortDir, repoId, perPage, dateFrom, dateTo] // eslint-disable-line
  );

  const goToSuggestion = (id: number) => {
    navigate(`${DOC_ROUTE_BASE}/${id}`);
    setOpen(false);
    setActiveIndex(-1);
  };
  React.useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const go = (p: number) => p >= 1 && p <= lastPage && fetchData(p);

  return (
    <main className="min-h-screen bg-background">
      <TopNav />
      <section className="py-6 lg:py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* filtros arriba */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[240px]">
              <Input
                placeholder="Buscar…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              />
               {open && (loading || suggestions.length > 0) && (
                  <div
                    ref={listRef}
                    id="autocomplete-listbox"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-xl border bg-white shadow"
                  >
                    {loading && (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando…
                      </div>
                    )}

                    {!loading &&
                      suggestions.map((sug, idx) => {
                        const sanitized = allowOnlyMark(sug.title);
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={sug.id}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            onClick={() => goToSuggestion(sug.id)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${isActive ? "bg-gray-100" : "hover:bg-gray-50"
                              }`}
                          >
                            <span
                              // Mostramos SOLO <mark> del backend
                              dangerouslySetInnerHTML={{ __html: sanitized }}
                              className="block leading-snug [&>mark]:bg-yellow-200/60 [&>mark]:px-0.5 [&>mark]:rounded"
                            />
                          </button>
                        );
                      })}

                    {!loading && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                    )}
                  </div>
                )}
            </div>

            <Select value={searchIn} onValueChange={(v) => setSearchIn(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="autores">Autores</SelectItem>
                <SelectItem value="abstract">Resumen</SelectItem>
                <SelectItem value="key_words">Palabras clave</SelectItem>
              </SelectContent>
            </Select>



            <Select
              value={String(repoId ?? "all")}
              onValueChange={(v) => setRepoId(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seleccionar repositorio</SelectItem>
                <SelectItem value={String(REPO_DOCUMENTO)}>Documentos</SelectItem>
                <SelectItem value={String(REPO_MAPA)}>Mapas</SelectItem>
                <SelectItem value={String(REPO_DATASET)}>Datasets</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <Label>Ordernar por:</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Vistas</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="autores">Autores</SelectItem>
                <SelectItem value="abstract">Resumen</SelectItem>
                <SelectItem value="key_words">Palabras clave</SelectItem>
                {/* ⬇️ nuevo campo */}
                <SelectItem value="date_issued">Fecha (date_issued)</SelectItem>
              </SelectContent>
            </Select>
              </div>
              <div>
                <Label>Orden:</Label>
                <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="asc/desc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descendente</SelectItem>
                    <SelectItem value="asc">Ascendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="">
                <Label>Desde:</Label>
                <input
                  type="month"
                  className="bg-white w-full h-10 rounded-md border px-3 text-sm"
                  value={dateFrom}
                  // opcional: limita máximo al "hasta"
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <Label>Hasta:</Label>
                <input
                  type="month"
                  className="bg-white w-full h-10 rounded-md border px-3 text-sm"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

            </div>



          </div>

          <Button className="bg-azul " onClick={() => fetchData(1)} disabled={loading}>
            {loading ? "Buscando…" : "Buscar"}
          </Button>
          {/* grid resultados */}
           {lastPage > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {page} de {lastPage} • {total} resultados
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        go(page - 1);
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        go(page + 1);
                      }}
                      className={page === lastPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {rows.map((r) => (
              <ResourceTile key={r.id} r={r} />
            ))}
          </div>

          {!loading && rows.length === 0 && (
            <div className="text-center text-muted-foreground py-16">Sin resultados</div>
          )}
          {loading && <div className="text-center text-muted-foreground py-12">Cargando…</div>}

          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {page} de {lastPage} • {total} resultados
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        go(page - 1);
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        go(page + 1);
                      }}
                      className={page === lastPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* accesos rápidos a vistas por tipo */}
          <div className="mt-8 flex gap-3 text-sm">
            <Button variant="outline" asChild>
              <Link to="/documentos">Solo Documentos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mapas">Solo Mapas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/datasets">Solo Datasets</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
