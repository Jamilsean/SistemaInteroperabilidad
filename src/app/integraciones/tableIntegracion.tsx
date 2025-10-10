import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseAxiosError } from "@/lib/http-error";
import { eliminarRelacion, getRelaciones } from "@/services/relacionService";
import type { Relacion } from "@/types/relaciones";
import {  Search, Trash } from "lucide-react";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner" 

export type TableIntegracionRef = { reload: () => void };

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  return d.toLocaleString();
}

const TableIntegracion = forwardRef<TableIntegracionRef>((_, ref) => {

  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [loading, setLoading] = useState(false);
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
   useImperativeHandle(ref, () => ({ reload: fetchRelaciones }), []);
  const fetchRelaciones = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getRelaciones(2, page);
      setRelaciones(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setCantidadRegistro(data.total);
      setCantidadRegistroEnVista(data.to)
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRelaciones(currentPage);

  }, [currentPage]);

  async function handleDelete(id: number) {
    const p = (async () => {
      await eliminarRelacion(id);
      await fetchRelaciones(currentPage); // si aquí te desmonta el Toaster, usa (1) o (2)
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
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "DOCUMENTO":
        return "bg-red-100 text-red-800 border-red-200"
      case "DATAVERSE":
        return "bg-red-100 text-red-800 border-red-200"
      case "MAPA":
        return "bg-green-100 text-green-800 border-green-200"
      case "DSPACE":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) return <div className="flex items-center space-x-4">
    DATOS CARGANDO
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>;

  return (
    <div className="flex flex-col">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-4 my-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por #ID o repositorio..."
            className="pl-8"
          />
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Tabla de relaciones registradas</CardTitle>
          <CardDescription>
            Total de relaciones: {cantidadRegistro}. Registros mostrados: {cantidadRegistroEnVista}.

          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* {loading ? (
            <div className="p-4">Cargando…</div>
          ) : err ? (
            <div className="p-4 text-red-600">{err}</div>
          ) : ( */}
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Números de página */}
              {renderPageNumbers()}

              {/* Ellipsis si hay muchas páginas */}
              {lastPage > 5 && currentPage < lastPage - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < lastPage) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === lastPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[300px]">Recurso Origen</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[300px]">Recurso Origen</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[100px]">Detalle Integración</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 w-[120px]">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>

              {relaciones.map((h) => {
                // const estado = getEstado(h);
                //       <tr key={r.id}>
                //   <td>{r.id}</td>
                //   <td>{r.confianza}</td>
                //   <td>{r.tipo_relacion}</td>
                //   <td>
                //     <a href={r.uri_origen} target="_blank" rel="noopener noreferrer">
                //       {r.title_origen}
                //     </a>
                //   </td>
                //   <td>{r.repo_nombre_origen}</td>
                //   <td>
                //     <a href={r.uri_destino} target="_blank" rel="noopener noreferrer">
                //       {r.title_destino}
                //     </a>
                //   </td>
                //   <td>{r.repo_nombre_destino}</td>
                // </tr>

                // const progreso = h.total_records > 0 ? (h.updated_records / h.total_records) * 100 : 0;
                return (
                  <TableRow
                    key={h.id}
                    className={`border-b hover:bg-gray-50/5`}
                  >
                    <TableCell className="px-3 py-3 align-top">
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-900 max-w-[250px] whitespace-normal break-words">
                          {h.recurso_origen.title}
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Identificador</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 max-w-[250px] whitespace-normal break-words">

                            {h.recurso_origen.autores}
                          </div>
                        </div>

                        <div className="pt-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300"
                          >
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
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Identificador</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 max-w-[250px] whitespace-normal break-words">{h.recurso_destino.raw_metadata.identifier}</div>
                        </div>
                        <div className="pt-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300"
                          >
                            {h.recurso_destino.repositorio.nombre}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 align-top content-center">
                      <div className="space-y-3 flex flex-col h-full   items-center">
                        <Badge
                          variant={h.tipo_relacion === "AUTOMÁTICO" ? "default" : "secondary"}
                          className={`text-xs font-medium flex   px-3 py-1 ${h.tipo_relacion === "AUTOMÁTICO"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-green-100 text-green-800 border-green-200"
                            }`}
                        >
                          {h.tipo_relacion}
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${getResourceTypeColor("" + h.esta_aprobada)}`}
                          >{ h.esta_aprobada}</Badge>
                        </Badge>
                        {formatDateTime(h.updated_at)}
                        <div className="text-xs text-gray-600 uppercase tracking-wide flex justify-center">{h.confianza}%</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 align-top">
                      <div className="flex flex-col items-center gap-3">

                        <div className="flex gap-1">

                          <div className="h-8 w-8 flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center  content-center ">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Seleccionar como origen">
                                    <Trash className="h-10 w-10 text-red-600" />

                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Seleccionar recurso origen?</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                      <div className="text-muted-foreground text-sm flex flex-col gap-y-2">

                                        La relación será eliminada entre los recursos:

                                        <div className="border-2 border-gray-200 px-1 py-3 rounded-2xl bg-gray-50">
                                          <strong>Recurso origen:</strong>
                                          <p className="text-black mt-2">{h.recurso_origen.title}</p>
                                        </div>
                                        <div className="border-2 border-gray-200 px-1 py-3 rounded-2xl bg-gray-50">
                                          <strong>Recurso destino:</strong>
                                          <p className="text-black mt-2">{h.recurso_destino.title}</p>
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
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Números de página */}
              {renderPageNumbers()}

              {/* Ellipsis si hay muchas páginas */}
              {lastPage > 5 && currentPage < lastPage - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < lastPage) handlePageChange(currentPage + 1);
                  }}
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
