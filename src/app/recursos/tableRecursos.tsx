import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRecursos } from "@/services/recursosService";
import type { Recurso } from "@/types/recursos";
import type { Repositorios } from "@/types/repositorios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftToLine, ArrowRightToLine, Eye, Filter, Link2, Search, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { listRepositorios } from "@/services/repositorioService";
import { Label } from "@/components/ui/label";
import { crearRelacion } from "@/services/relacionService";
import { Textarea } from "@/components/ui/textarea";
import { parseAxiosError, type ServerError } from "@/lib/http-error";
import type { Especialista } from "@/types/especialistas";
import { getEspecialistas } from "@/services/especialistaService";
import { enviarCorreosRelacion } from "@/services/votoService";
import { Checkbox } from "@/components/ui/checkbox"; // ⬅️ añadido

export type TableIntegracionRef = { reload: () => void };

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  return d.toLocaleString();
}

const TableIRecursos = forwardRef<TableIntegracionRef>((_,ref) => {
  const [repositorios, setRepositorios] = useState<Repositorios[]>([]);
  const [idRepositorio, setIdRepositorio] = useState<number[]>([1, 2, 3]);
  const [selectedRepoValue, setSelectedRepoValue] = useState<string>("");
  const [per_page, setPer_page] = useState<number>(5);
  const [search, setSearch] = useState("");

  // PARA relación
  const [recursoOrigen, setRecursoOrigen] = useState<Recurso | null>(null);
  const [recursoDestino, setRecursoDestino] = useState<Recurso | null>(null);
  const [tipo_relacion, setTipo_relacion] = useState<string>("");
  const [comentario, setComentario] = useState<string>("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const hasBoth = useMemo(() => !!(recursoOrigen && recursoDestino), [recursoOrigen, recursoDestino]);
  const [confirmTitle, setConfirmTitle] = useState<string>("");
  const [, setConfirmRaw] = useState<string>("");

  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  // ⬇️ ahora soporte múltiple
  const [especialistaIds, setEspecialistaIds] = useState<number[]>([]);
  const [searchEspecialista, setSearchEspecialista] = useState<string>("");

  const [confirmErrors, setConfirmErrors] = useState<Record<string, string[]> | undefined>(undefined);

  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const handleRepoChange = (v: string) => {
    setSelectedRepoValue(v);
    if (v === "0") {
      const allIds = repositorios.map(r => r.id);
      setIdRepositorio(allIds);
    } else {
      const id = Number(v);
      setIdRepositorio([id]);
    }
  };
  const handleFilter = async () => {
    fetchRelaciones();
  };
  useImperativeHandle(ref, () => ({ reload: fetchRelaciones }), []);

  const fetchRelaciones = async (page = 1, por_pagina = per_page, id_repo = idRepositorio) => {
    setLoading(true);
    try {
      const data_repositorio = await listRepositorios();
      setRepositorios(data_repositorio);
      const data = await getRecursos(page, por_pagina, id_repo, search);
      setRecursos(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchEspecialistas = async (per_page: 100) => {
    try {
      const resp = await getEspecialistas({ per_page });
      setEspecialistas(resp.data);
    } catch (e) { console.error(e); }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "DOCUMENTO":
      case "DATAVERSE":
        return "bg-red-100 text-red-800 border-red-200"
      case "MAPA":
      case "DSPACE":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  useEffect(() => {
    fetchRelaciones(currentPage);
    fetchEspecialistas(100);
  }, [currentPage]);

  const seleccionarOrigen = (r: Recurso) => {
    setRecursoOrigen(r);
    setRecursoDestino(null);
  };
  const seleccionarDestino = (r: Recurso) => {
    if (recursoOrigen && r.id === recursoOrigen.id) return;
    setRecursoDestino(r);
  };

  // toggle para multiselección
  const toggleEspecialista = (id: number) => {
    setEspecialistaIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const realizarRelacion = async () => {
    if (!recursoOrigen || !recursoDestino) return;

    try {
      const res = await crearRelacion({
        recurso_origen_id: recursoOrigen.id,
        tipo_relacion,
        recurso_destino_id: recursoDestino.id,
        comentario,
      });
      const relacionId = (res as any)?.data?.id ?? (res as any)?.id ?? null;

      setConfirmTitle("Se registró la relación");
      setConfirmMsg(res.message || "Relación creada correctamente");
      setConfirmErrors(undefined);
      setConfirmRaw("");
      setOpenConfirm(true);

      // ⬇️ si hay 1 o varios especialistas seleccionados, enviar
      if (relacionId && especialistaIds.length > 0) {
        try {
          const correoRes = await enviarCorreosRelacion(relacionId, {
            relacion_id: relacionId,
            especialistas: especialistaIds, // <— ahora arreglo
          });
          setConfirmMsg(
            (res.message || "Relación creada correctamente") +
              `\n${correoRes?.message ?? "Correos enviados a especialistas"}`
          );
        } catch (sendErr) {
          console.error(sendErr);
          setConfirmMsg(
            (res.message || "Relación creada") +
              "\nNo se pudo enviar correo a los especialistas seleccionados."
          );
        }
      }

      // limpiar
      setRecursoOrigen(null);
      setRecursoDestino(null);
      setTipo_relacion("");
      setComentario("");
      setEspecialistaIds([]);
      setSearchEspecialista("");
    } catch (e: any) {
      const err: ServerError = parseAxiosError(e);
      setConfirmTitle(`Error ${err.status || ""}`.trim());
      setConfirmMsg(err.message);
      setConfirmErrors(err.errors);
      setConfirmRaw(err.raw ? JSON.stringify(err.raw, null, 2) : "");
      setOpenConfirm(true);
    }
  };

  const limpiarOrigen = () => {
    setRecursoOrigen(null);
    setRecursoDestino(null);
  };
  const limpiarDestino = () => setRecursoDestino(null);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) setCurrentPage(page);
  };

  if (loading) return (
    <div className="flex items-center space-x-4">
      DATOS CARGANDO
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );

  // lista filtrada por texto
  const filteredEspecialistas = especialistas.filter((e) => {
    const q = searchEspecialista.trim().toLowerCase();
    if (!q) return true;
    const nombre = `${e.nombres ?? ""} ${e.apellidos ?? ""}`.toLowerCase();
    const correo = (e.email ?? "").toLowerCase();
    return nombre.includes(q) || correo.includes(q);
  });

  return (
    <div className="flex flex-col">

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle || "Resultado"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{confirmMsg}</p>

                {confirmErrors && (
                  <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
                    <div className="font-medium mb-1">Errores de validación:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(confirmErrors).map(([field, msgs]) => (
                        <li key={field}>
                          <span className="font-medium">{field}:</span>{" "}
                          {Array.isArray(msgs) ? msgs.join(" • ") : String(msgs)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpenConfirm(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className=" my-4 text-muted-foreground flex items-center gap-2">
        <span>
          Origen:&nbsp;
          {recursoOrigen ? <b>#{recursoOrigen.id}</b> : <i>no seleccionado</i>}
        </span>
        {recursoOrigen && (
          <Button variant="ghost" size="icon" onClick={limpiarOrigen} title="Quitar origen">
            <X className="h-4 w-4" />
          </Button>
        )}
        <span className="ml-2">
          Destino:&nbsp;
          {recursoDestino ? <b>#{recursoDestino.id}</b> : <i>no seleccionado</i>}
        </span>
        {recursoDestino && (
          <Button variant="ghost" size="icon" onClick={limpiarDestino} title="Quitar destino">
            <X className="h-4 w-4" />
          </Button>
        )}

        {hasBoth && (
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Link2 className="h-4 w-4" />
                  &nbsp;Realizar relación
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Realizar relación</DialogTitle>
                  <DialogDescription>
                    A continuación realizará la relación entre los recursos seleccionados
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="tipo_relacion">Tipo relación</Label>
                    <Input
                      id="tipo_relacion"
                      name="tipo_relacion"
                      placeholder="Relación implícita"
                      value={tipo_relacion}
                      onChange={(e) => setTipo_relacion(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="comentario">Comentario</Label>
                    <Textarea
                      id="comentario"
                      name="comentario"
                      placeholder="Registre un comentario de la relación"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                    />
                  </div>

                  {/* 🔎 Multi selección + búsqueda de especialistas */}
                  <div className="grid gap-2">
                    <Label>Especialistas (opcional)</Label>
                    <Input
                      placeholder="Buscar especialista por nombre o correo…"
                      value={searchEspecialista}
                      onChange={(e) => setSearchEspecialista(e.target.value)}
                    />
                    <div className="max-h-60 overflow-auto rounded-md border p-2 space-y-1">
                      {filteredEspecialistas.length ? (
                        filteredEspecialistas.map((e) => {
                          const id = e.id!;
                          const checked = especialistaIds.includes(id);
                          return (
                            <label
                              key={id}
                              className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleEspecialista(id)}
                              />
                              <div className="flex flex-col text-sm">
                                <span className="font-medium">
                                  {e.nombres} {e.apellidos}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {e.email ?? ""}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground px-2 py-4">
                          Sin resultados para “{searchEspecialista}”
                        </div>
                      )}
                    </div>
                    {especialistaIds.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Seleccionados: {especialistaIds.length}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 ml-2"
                          onClick={() => setEspecialistaIds([])}
                        >
                          Limpiar
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Se enviará un correo a todos los especialistas seleccionados para que emitan su voto.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={realizarRelacion} className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Realizar relación
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        )}
      </div>

      <form>
        <div className="flex items-center gap-4 my-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por #ID o repositorio..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <Select value={String(selectedRepoValue)} onValueChange={handleRepoChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecciona repositorio destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0">Todos los repositorios</SelectItem>
                  {repositorios.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Select value={String(per_page)} onValueChange={(v) => setPer_page(Number(v))}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecciona cantidad por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">Cantidad por páginas</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="default" size="sm" onClick={handleFilter} disabled={loading}>
            <Filter className="w-4 h-4 mr-2" />
            {loading ? "Filtrando..." : "Filtrar"}
          </Button>
        </div>
      </form>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Tabla de Recursos</CardTitle>
        </CardHeader>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
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

        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden scroll-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[350px] font-semibold text-gray-700">Información del Recurso</TableHead>
                  <TableHead className="w-[350px] font-semibold text-gray-700">Contenido</TableHead>
                  <TableHead className="w-[200px] font-semibold text-gray-700">Detalle</TableHead>
                  <TableHead className="w-[200px] font-semibold text-gray-700"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recursos.map((resource) => {
                  const esOrigen = recursoOrigen?.id === resource.id;
                  const esDestino = recursoDestino?.id === resource.id;
                  return (
                    <TableRow key={resource.id}>
                      <TableCell className="align-top p-4 w-[350px]">
                        <div className="space-y-3">
                          <div>
                            <h3 className="max-w-[600px] whitespace-normal font-medium text-sm text-gray-900 leading-tight break-words hyphens-auto">
                              {resource.title}
                            </h3>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1 ">Autores:</p>
                            <p className="text-xs text-gray-700  w-[350px] whitespace-normal break-words">{resource.autores}</p>
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="text-xs font-mono bg-cyan-100">ID: {resource.id}</Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Palabras clave:</p>
                            <div className=" gap-1 w-[350px] whitespace-normal break-words">
                              {resource.key_words}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Repositorio:</p>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${getResourceTypeColor(resource.repositorio.nombre)}`}
                            >
                              {resource.repositorio.nombre}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Tipo Recurso:</p>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${getResourceTypeColor(resource.tipo_recurso.nombre)}`}
                            >
                              {resource.tipo_recurso.nombre}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Creación:</p>
                              <p className="text-xs text-gray-900 font-mono">{formatDateTime(resource.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1">Actualización:</p>
                              <p className="text-xs text-gray-900 font-mono">{formatDateTime(resource.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top p-4 flex gap-1.5">
                        <Eye className="text-blue-500" />
                        <div className="flex items-center gap-2">
                          {esOrigen && (<span className="text-xs rounded bg-blue-50 text-blue-700 px-2 py-0.5">Origen</span>)}
                          {esDestino && (<span className="text-xs rounded bg-green-50 text-green-700 px-2 py-0.5">Destino</span>)}
                        </div>

                        {!recursoOrigen && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Seleccionar como origen">
                                <ArrowRightToLine className="text-blue-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Seleccionar recurso origen?</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="text-muted-foreground text-sm">
                                    Este recurso se marcará como <strong>origen</strong>:
                                    <p className="text-black mt-2">{resource.title}</p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => seleccionarOrigen(resource)}>
                                  Aceptar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {recursoOrigen && !esOrigen && !esDestino && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Seleccionar como destino"
                                disabled={resource.id === recursoOrigen.id}
                              >
                                <ArrowLeftToLine className="text-green-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Seleccionar recurso destino?</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="text-muted-foreground text-sm">
                                    Este recurso se marcará como <strong>destino</strong>:
                                    <p className="text-black mt-2">{resource.title}</p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => seleccionarDestino(resource)}>
                                  Aceptar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
export default TableIRecursos;