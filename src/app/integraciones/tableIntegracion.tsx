import { useRef } from "react";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseAxiosError } from "@/lib/http-error";
import { eliminarRelacion, getRelacionesQuery } from "@/services/relacionService"; // 👈 usa la nueva
import type { Relacion } from "@/types/relaciones";
import { Search, Trash } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner";

import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

import useDebounce from "@/hooks/useDebounce";
import { useAuthZ } from "@/hooks/useAuthZ";

export type TableIntegracionRef = { reload: () => void };

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  return d.toLocaleString();
}

const TableIntegracion = forwardRef<TableIntegracionRef>((_, ref) => {
  const reqSeqRef = useRef(0);
const { can } = useAuthZ();
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 450);

  const [estado, setEstado] = useState<"all" | "por_evaluar" | "evaluando" | "aprobada" | "desaprobada" | "desierto">("all");
  const [searchIn, setSearchIn] = useState<string>("*");
  const [sortBy, setSortBy] =
    useState<"id" | "confianza" | "tipo_relacion" | "estado_aprobacion" | "created_at" | "updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [perPage, setPerPage] = useState<number>(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [cantidadRegistro, setCantidadRegistro] = useState<number>(0);
  const [cantidadRegistroEnVista, setCantidadRegistroEnVista] = useState<number>(0);

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= lastPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };

  useImperativeHandle(ref, () => ({ reload: () => fetchRelaciones(currentPage) }), [currentPage]);

  const fetchRelaciones = async (page = 1) => {
  const mySeq = ++reqSeqRef.current; 
  setLoading(true);
  try {
    const data = await getRelacionesQuery({
      page,
      per_page: perPage,
      estado_aprobacion: estado === "all" ? undefined : estado,
      search: debouncedSearch,
      search_in: searchIn,      
      sort_by: sortBy,
      sort_dir: sortDir,
    });

     if (mySeq !== reqSeqRef.current) return;

    setRelaciones(data.data);
    setCurrentPage(data.current_page);
    setLastPage(data.last_page);
    setCantidadRegistro(data.total);
    setCantidadRegistroEnVista(data.to);
  } catch (error) {
    if (mySeq === reqSeqRef.current) console.error(error);
  } finally {
    if (mySeq === reqSeqRef.current) setLoading(false);
  }
};

   useEffect(() => {
    fetchRelaciones(currentPage);
   }, [currentPage]);

   useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchRelaciones(1);
   }, [debouncedSearch, estado, searchIn, sortBy, sortDir, perPage]);

  async function handleDelete(id: number) {
    const p = (async () => {
      await eliminarRelacion(id);
      await fetchRelaciones(currentPage);
    })();

    toast.promise(p, {
      loading: "Eliminando…",
      success: "Se eliminó correctamente la relación",
      error: (e) => parseAxiosError(e).message || "No se pudo eliminar la relación",
    });
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) setCurrentPage(page);
  };


  const estados = [
    { v: "all", t: "Todos" },
    { v: "por_evaluar", t: "Por evaluar" },
    { v: "evaluando", t: "Evaluando" },
    { v: "aprobada", t: "Aprobada" },
    { v: "desaprobada", t: "Desaprobada" },
    { v: "desierto", t: "Desierto" },
  ] as const;

  // para mostrar estado aún si backend usa otro key (fallback)
  const getEstadoAprob = (h: Relacion) =>
    (h as any).estado_aprobacion ?? (h as any).esta_aprobada ?? "-";

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        DATOS CARGANDO
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar de filtros (responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar relación…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Campo en el que buscar */}
        <Select value={searchIn} onValueChange={(v) => setSearchIn(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Buscar en…" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="*">Todos los campos (*)</SelectItem>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="tipo_relacion">Tipo de relación</SelectItem>
              <SelectItem value="estado_aprobacion">Estado aprobación</SelectItem>
              {/* Dependiendo de tu backend, puedes tener alias como:
                recurso_origen, recurso_destino, title_origen, title_destino, etc. */}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={(v) => setEstado(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado de aprobación" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {estados.map(e => (
                <SelectItem key={e.v} value={e.v}>{e.t}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>


        {/* Orden */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="updated_at">Actualización</SelectItem>
                <SelectItem value="created_at">Creación</SelectItem>
                <SelectItem value="confianza">Confianza</SelectItem>
                <SelectItem value="tipo_relacion">Tipo relación</SelectItem>
                <SelectItem value="estado_aprobacion">Estado aprobación</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Per page */}
        <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de relaciones registradas</CardTitle>
          <CardDescription>
            Total de relaciones: {cantidadRegistro}. Registros mostrados: {cantidadRegistroEnVista}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Paginación superior */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {renderPageNumbers()}
              {lastPage > 5 && currentPage < lastPage - 2 && (
                <PaginationItem><PaginationEllipsis /></PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < lastPage) handlePageChange(currentPage + 1); }}
                  className={currentPage === lastPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* ——— Vista móvil: Cards ——— */}
          <div className="md:hidden grid gap-3">
            {relaciones.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No se encontraron resultados
                {debouncedSearch ? <> para “<b>{debouncedSearch}</b>”</> : null}
                {estado ? <> con estado <b>{estado}</b></> : null}.
              </div>
            ) : null}

            {relaciones.map((h) => {
              const estadoAprob = getEstadoAprob(h);
              return (
                <div key={h.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">ID #{h.id}</div>
                    <Badge variant="outline" className="text-xs">{estadoAprob}</Badge>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-semibold line-clamp-2">{h.recurso_origen.title}</div>
                    <div className="text-xs text-muted-foreground">{h.recurso_origen.repositorio.nombre}</div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-semibold line-clamp-2">{h.recurso_destino.title}</div>
                    <div className="text-xs text-muted-foreground">{h.recurso_destino.repositorio.nombre}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span>Tipo: <b>{h.tipo_relacion}</b></span>
                    <span>Confianza: <b>{h.confianza}%</b></span>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(h.updated_at)}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Eliminar relación">
                          <Trash className="h-5 w-5 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar relación?</AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="text-muted-foreground text-sm flex flex-col gap-y-2">
                              La relación será eliminada entre:
                              <div className="border px-2 py-2 rounded bg-gray-50">
                                <strong>Origen: </strong>{h.recurso_origen.title}
                              </div>
                              <div className="border px-2 py-2 rounded bg-gray-50">
                                <strong>Destino: </strong>{h.recurso_destino.title}
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(h.id)}>
                            Aceptar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ——— Vista desktop: Tabla ——— */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[300px]">Recurso Origen</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[300px]">Recurso Destino</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[160px]">Detalle</TableHead>
                    {can({ anyOf: ["relaciones.delete"] }) && (<TableHead className="font-semibold text-gray-900 px-6 py-4 w-[120px]">Acciones</TableHead> )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {relaciones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-sm text-muted-foreground">
                      No se encontraron resultados
                      {debouncedSearch ? <> para “<b>{debouncedSearch}</b>”</> : null}
                      {estado ? <> con estado <b>{estado}</b></> : null}.
                    </TableCell>
                  </TableRow>
                )}

                {relaciones.map((h) => {
                  const estadoAprob = getEstadoAprob(h);
                  return (
                    <TableRow key={h.id} className="border-b hover:bg-gray-50/5">
                      <TableCell className="px-3 py-3 align-top">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-900 max-w-[250px] whitespace-normal break-words">
                            {h.recurso_origen.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Autores</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 max-w-[250px] whitespace-normal break-words">
                            {h.recurso_origen.autores}
                          </div>
                          <div className="pt-1">
                            <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300">
                              {h.recurso_origen.repositorio.nombre}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-3 align-top">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-900 max-w-[250px] whitespace-normal break-words">
                            {h.recurso_destino.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Identificador</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 max-w-[250px] whitespace-normal break-words">
                            {h.recurso_destino.raw_metadata?.identifier}
                          </div>
                          <div className="pt-1">
                            <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300">
                              {h.recurso_destino.repositorio.nombre}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-3 align-top">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-medium bg-green-100 text-green-800 border-green-200"
                            >
                              {h.tipo_relacion}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium">
                              {String(estadoAprob)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">Confianza: {h.confianza}%</div>
                          <div className="text-xs text-muted-foreground">{formatDateTime(h.updated_at)}</div>
                        </div>
                      </TableCell>

                        {can({ anyOf: ["relaciones.delete"] }) && (<TableCell className="px-3 py-3 align-top">
                        <div className="flex items-center justify-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Eliminar relación">
                               
                                <Trash className="h-5 w-5 text-red-600" />
                               
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar relación?</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="text-muted-foreground text-sm flex flex-col gap-y-2">
                                    Se eliminará la relación entre:
                                    <div className="border px-2 py-2 rounded bg-gray-50">
                                      <strong>Origen: </strong>{h.recurso_origen.title}
                                    </div>
                                    <div className="border px-2 py-2 rounded bg-gray-50">
                                      <strong>Destino: </strong>{h.recurso_destino.title}
                                    </div>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(h.id)}>
                                  Aceptar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell> )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación inferior */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {renderPageNumbers()}
              {lastPage > 5 && currentPage < lastPage - 2 && (
                <PaginationItem><PaginationEllipsis /></PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage < lastPage) handlePageChange(currentPage + 1); }}
                  className={currentPage === lastPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
});

export default TableIntegracion;
