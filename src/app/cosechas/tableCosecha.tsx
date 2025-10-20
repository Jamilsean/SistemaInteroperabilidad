import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Harvest } from "@/types/harvests";
import type { Repositorios } from "@/types/repositorios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  FileText, Database, Monitor, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { getHarvests } from "@/services/harvestService";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  useNavigate } from "react-router-dom";
import { listRepositorios } from "@/services/repositorioService";
import { toast } from "sonner";

// ---------- Helpers ----------
function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  return d.toLocaleString();
}

type Estado = "completado" | "procesando" | "error";
export type TableCosechasRef = { reload: () => void };

function getEstado(h: Harvest): Estado {
  if (h.error) return "error";
  if (h.finished_at) return "completado";
  return "procesando";
}

const EstadoBadge = ({ estado }: { estado: Estado }) => {
  switch (estado) {
    case "completado":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      );
    case "procesando":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <RefreshCw className="w-3 h-3 mr-1" />
          Procesando
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="secondary">Desconocido</Badge>;
  }
};

const RepoButton = ({ name }: { name: string }) => {
  const config = {
    DSPACE: { Icon: Database, variant: "default" as const, color: "bg-blue-500 hover:bg-blue-600" },
    DATAVERSE: { Icon: FileText, variant: "default" as const, color: "bg-green-500 hover:bg-green-600" },
    GEONETWORK: { Icon: Monitor, variant: "default" as const, color: "bg-orange-500 hover:bg-orange-600" },
  };
  const entry = (config as any)[name] ?? config.DSPACE;
  const { Icon, variant, color } = entry;
  return (
    <Button size="sm" variant={variant} className={variant === "default" ? color : ""}>
      <Icon className="w-3 h-3 mr-1" />
      {name}
    </Button>
  );
};
// ---------- Componente ----------
const TableCosechas = forwardRef<TableCosechasRef>((_, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [repositorios, setRepositorios] = useState<Repositorios[]>([]);
  const [per_page, setPer_page] = useState<number>(5);
  const navigate = useNavigate()

  // REPOSITORIO
  const [idRepositorio, setIdRepositorio] = useState<number[]>([1, 2, 3]);

  const [selectedRepoValue, setSelectedRepoValue] = useState<string>("");

  const [err, setErr] = useState("");
  const [rows, setRows] = useState<Harvest[]>([]); // 👈 usa el tipo unificado
  const fetchData = async (page = 1, por_pagina = per_page,id_repo=idRepositorio) => {
    setLoading(true);
    setErr("");
    try {
      const data_repositorio = await listRepositorios();
      setRepositorios(data_repositorio);
      const data = await getHarvests(page, por_pagina, id_repo);
      setRows(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setTo(Number(data.to));
      setTotal(Number(data.to));
    } catch (e: any) {
      setErr(e?.response?.status ? `Edrror ${e.response.status}` : "Error de conexión");
      if (e.response.status == '403') {
        localStorage.removeItem("token")

        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  useImperativeHandle(ref, () => ({ reload: fetchData }), []);

  useEffect(() => { fetchData(currentPage, per_page,idRepositorio); }, [currentPage, per_page,idRepositorio]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) setCurrentPage(page);
  };
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

  // const buscar = () => {
  //   fetchData(currentPage, per_page);
  // }

  const handleRepoChange = (v: string) => {
    setSelectedRepoValue(v);

    if (v === "0") {
      // Todos: [1,2,3,...]
      const allIds = repositorios.map(r => r.id);
      setIdRepositorio(allIds);
    } else {
      // Solo uno
      const id = Number(v);
      setIdRepositorio([id]);
    }
  };
  return (
    <div className="flex flex-col">
      {/* Barra de herramientas */}


      <form  >
        <div className="flex items-center gap-4 my-2">
          <div className="relative flex-1 max-w-sm">
          <Select  value={String(selectedRepoValue)} onValueChange={(v) => handleRepoChange(v)} >
              <SelectTrigger className="w-full">
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

          <Select value={String(per_page)} onValueChange={(v) => setPer_page(Number(v))} >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecciona cantidad por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">Cantidad por páginas</SelectItem>
                <SelectItem value="5">5</SelectItem>
                 <SelectItem value="15">15</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Cosechas</CardTitle>
          <CardDescription>
            Total: {total} - Registros mostrados: {to}.

          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4">Cargando…</div>
          ) : err ? (
            <div className="p-4 text-red-600">{err}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>Repositorio</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((h) => {
                  const estado = getEstado(h);
                  const progreso = h.total_records > 0 ? (h.updated_records / h.total_records) * 100 : 0;
                  return (
                    <TableRow key={h.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          #{h.id}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <RepoButton name={h.repositorio?.nombre ?? "DSPACE"} />
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {h.repositorio?.base_url ?? "-"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Inicio: </span>
                            {formatDateTime(h.started_at)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fin: </span>
                            {formatDateTime(h.finished_at)}
                            {h.total_records}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total:</span>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {h.total_records}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nuevos:</span>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {h.new_records}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Actualizados:</span>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {h.updated_records}
                              </Badge>

                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Repo ID:</span>
                              <Badge variant="outline">{h.repositorio_id}</Badge>
                            </div>
                          </div>
                          <Progress value={progreso} className="h-1" />
                        </div>
                      </TableCell>

                      <TableCell>
                        <EstadoBadge estado={estado} />
                        {h.error && <div className="text-xs text-red-600 mt-1">{h.error}</div>}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast(JSON.stringify(h, null, 2))}>
                              Ver detalles
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>Descargar reporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem >Reejecutar consulta</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>



          )}

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
export default TableCosechas;
