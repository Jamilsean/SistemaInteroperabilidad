"use client";
import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import {  getRecursosPublic } from "@/services/recursosService";
import type { Recurso, RecursosResponse } from "@/types/recursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import TopNav from "../landingv3/TopNav";
import { ResourceTile } from "./ResourceTile";


const REPO_DATASET = 1;
const REPO_DOCUMENTO = 2;
const REPO_MAPA = 3;

export default function BuscarPage() {
  const [params, setParams] = useSearchParams();

  const [page, setPage] = React.useState(Number(params.get("page") || 1));
  const [perPage] = React.useState(12);

  const [search, setSearch] = React.useState(params.get("search") || "");
  const [searchIn, setSearchIn] = React.useState<"title" | "autores" | "abstract" | "key_words">(
    (params.get("search_in") as any) || "title"
  );
  const [sortBy, setSortBy] = React.useState<"title" | "autores" | "abstract" | "key_words" | "views">(
    (params.get("sort_by") as any) || "views"
  );
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">((params.get("sort_dir") as any) || "desc");
  const [repoId, setRepoId] = React.useState<number | null>(params.get("repositorio_id") ? Number(params.get("repositorio_id")) : null);

  const [rows, setRows] = React.useState<Recurso[]>([]);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const syncURL = (p = page) => {
    const q = new URLSearchParams();
    if (search.trim()) q.set("search", search.trim());
    q.set("search_in", searchIn);
    q.set("sort_by", sortBy);
    q.set("sort_dir", sortDir);
    if (repoId) q.set("repositorio_id", String(repoId));
    q.set("page", String(p));
    setParams(q, { replace: true });
  };

  const fetchData = React.useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const repoArray = repoId ? [repoId] : [];
      const res: RecursosResponse = await getRecursosPublic(p, perPage, repoArray, search.trim(), searchIn, sortBy, sortDir);
      setRows(res.data);
      setLastPage(res.last_page || 1);
      setTotal(Number(res.total || res.data.length || 0));
      setPage(res.current_page || p);
      syncURL(res.current_page || p);
    } finally {
      setLoading(false);
    }
  }, [search, searchIn, sortBy, sortDir, repoId, perPage]); // eslint-disable-line

  React.useEffect(() => { fetchData(1); }, [fetchData]);

  const go = (p: number) => p >= 1 && p <= lastPage && fetchData(p);

  return (
    <main className="min-h-screen bg-background">
      <TopNav />
      <section className="py-6 lg:py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* filtros arriba */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[240px]">
              <Input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchData(1)} />
            </div>

            <Select value={searchIn} onValueChange={(v) => setSearchIn(v as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Campo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="autores">Autores</SelectItem>
                <SelectItem value="abstract">Resumen</SelectItem>
                <SelectItem value="key_words">Palabras clave</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Vistas</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="autores">Autores</SelectItem>
                <SelectItem value="abstract">Resumen</SelectItem>
                <SelectItem value="key_words">Palabras clave</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="asc/desc" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendente</SelectItem>
                <SelectItem value="asc">Ascendente</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(repoId ?? "all")}
              onValueChange={(v) => setRepoId(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={String(REPO_DOCUMENTO)}>Documentos</SelectItem>
                <SelectItem value={String(REPO_MAPA)}>Mapas</SelectItem>
                <SelectItem value={String(REPO_DATASET)}>Datasets</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-azul" onClick={() => fetchData(1)} disabled={loading}>
              {loading ? "Buscando…" : "Buscar"}
            </Button>
          </div>

          {/* grid resultados */}
          <div className=" p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {rows.map((r) => (<ResourceTile key={r.id} r={r} />))}
          </div>

          {!loading && rows.length === 0 && <div className="text-center text-muted-foreground py-16">Sin resultados</div>}
          {loading && <div className="text-center text-muted-foreground py-12">Cargando…</div>}

          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">Página {page} de {lastPage} • {total} resultados</div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); go(page - 1); }} className={page === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                  <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); go(page + 1); }} className={page === lastPage ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* accesos rápidos a vistas por tipo */}
          <div className="mt-8 flex gap-3 text-sm">
            <Button variant="outline" asChild><Link to="/documentos">Solo Documentos</Link></Button>
            <Button variant="outline" asChild><Link to="/mapas">Solo Mapas</Link></Button>
            <Button variant="outline" asChild><Link to="/datasets">Solo Datasets</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
