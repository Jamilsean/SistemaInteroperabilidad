import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCw, ExternalLink, ImageIcon, Server, Database, Globe2 } from "lucide-react";
import {
  SidebarTrigger
} from "@/components/ui/sidebar"
 import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getDashboard } from "@/services/dashboardService";
import type { DashboardResponse, DashboardRepositorio, CosechaItem } from "@/types/dashboard";
import { parseAxiosError } from "@/lib/http-error";
import { Separator } from "@radix-ui/react-separator";

// --------- helpers sin dependencias para “charts” ----------
function maxBy<T>(arr: T[], sel: (x: T) => number): number {
  return arr.reduce((m, x) => Math.max(m, sel(x)), 0);
}

function BarList({
  items,
  getLabel = (d: any) => d.label as string,
  getValue = (d: any) => d.value as number,
}: {
  items: any[];
  getLabel?: (d: any) => string;
  getValue?: (d: any) => number;
}) {
  const max = Math.max(1, maxBy(items, getValue));
  return (
    <div className="space-y-3">
      {items.map((d, i) => {
        const label = getLabel(d);
        const value = getValue(d);
        return (
          <div key={label + i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{label}</span>
              <span className="tabular-nums">{value}</span>
            </div>
            <div className="w-full h-3 rounded bg-muted">
              <div
                className="h-3 rounded bg-primary transition-[width]"
                style={{ width: `${(value / max) * 100}%` }}
                aria-label={`${label}: ${value}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// function Sparkline({ values, height = 64 }: { values: number[]; height?: number }) {
//   if (!values.length) return null;
//   const max = Math.max(...values) || 1;
//   const stepX = 100 / (values.length - 1 || 1);
//   const points = values.map((v, i) => {
//     const x = i * stepX;
//     const y = 100 - (v / max) * 100; // invertimos Y
//     return `${x},${y}`;
//   });
//   return (
//     <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
//       <polyline
//         points={points.join(" ")}
//         fill="none"
//         stroke="currentColor"
//         strokeWidth={2}
//         className="text-primary/70"
//       />
//     </svg>
//   );
// }

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}
// ----------------------------------------------------------

export default function DashboardLayout() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  const totalRepos = data?.repositorios?.length ?? 0;
  const totalRecursos = useMemo(
    () => (data?.repositorios || []).reduce((acc, r) => acc + (r.recursos_count || 0), 0),
    [data]
  );
  const cosechas = data?.cosechas;
  const ultimasCosechas: CosechaItem[] = cosechas?.ultimas_cosechas?.data || [];

  const repoBars = useMemo(
    () => (data?.repositorios || []).map((r) => ({ label: r.nombre, value: r.recursos_count })),
    [data]
  );

  const sortedCosechas = useMemo(() => {
    const arr = [...ultimasCosechas];
    arr.sort((a, b) => new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime());
    return arr;
  }, [ultimasCosechas]);

  // const sparkNuevos = sortedCosechas.map((c) => c.new_records);
  // const sparkTotales = sortedCosechas.map((c) => c.total_records);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-[280px] w-full" />
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  return (
        <div className="flex flex-col">

    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Sistema</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>DASHBOARD</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
    <div className="space-y-6 px-2 py-15">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de repositorios y cosechas</p>
        </div>
        <Button variant="outline" onClick={fetchDashboard}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refrescar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Repositorios</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">{totalRepos}</div>
            <Server className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recursos totales</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">{totalRecursos}</div>
            <Database className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cosechas exitosas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{cosechas?.total_cosechas_exitosas ?? 0}</div>
              <div className="text-xs text-muted-foreground">
                Errores: {cosechas?.total_cosechas_error ?? 0}
              </div>
            </div>
            <Globe2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* “Chart” Barras con shadcn (BarList) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recursos por repositorio</CardTitle>
        </CardHeader>
        <CardContent>
          <BarList items={repoBars} />
        </CardContent>
      </Card>

      {/* “Chart” Sparklines con shadcn (SVG) 
      <Card>
        <CardHeader>
          <CardTitle className="text-base">4Y</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedCosechas.length ? (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Nuevos</div>
                <Sparkline values={sparkNuevos} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Totales</div>
                <Sparkline values={sparkTotales} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xs text-muted-foreground">Cosechas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {cosechas?.total_cosechas ?? 0}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xs text-muted-foreground">Exitosas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {cosechas?.total_cosechas_exitosas ?? 0}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xs text-muted-foreground">Errores</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {cosechas?.total_cosechas_error ?? 0}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xs text-muted-foreground">Repos con cosecha</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {new Set(sortedCosechas.map((c) => c.repositorio?.nombre || c.repositorio_id)).size}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No hay cosechas recientes</div>
          )}
        </CardContent>
      </Card>
*/}
      {/* Cards por repositorio con último recurso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repositorios y último recurso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.repositorios || []).map((r: DashboardRepositorio) => (
              <Card key={r.id} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{r.nombre}</CardTitle>
                    <Badge variant="outline">{r.recursos_count} recursos</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{r.base_url}</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {r.ultimo_recurso ? (
                    <div className="space-y-2">
                      <div className="aspect-[16/9] w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                        {r.ultimo_recurso.url_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.ultimo_recurso.url_image}
                            alt={r.ultimo_recurso.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium line-clamp-2" title={r.ultimo_recurso.title}>
                          {r.ultimo_recurso.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Creado: {formatDateTime(r.ultimo_recurso.created_at)}
                        </div>
                        <a
                          href={r.ultimo_recurso.persistent_uri || r.base_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs underline"
                        >
                          Ver recurso <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sin recursos recientes</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla: últimas cosechas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas cosechas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Repositorio</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Nuevos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCosechas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">#{c.id}</TableCell>
                    <TableCell>{c.repositorio?.nombre || c.repositorio_id}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(c.started_at)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(c.finished_at)}</TableCell>
                    <TableCell className="text-right">{c.new_records}</TableCell>
                    <TableCell className="text-right">{c.total_records}</TableCell>
                    <TableCell>
                      {c.error ? <Badge variant="destructive">Error</Badge> : <Badge variant="secondary">OK</Badge>}
                    </TableCell>
                  </TableRow>
                ))}

                {!sortedCosechas.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      No hay cosechas recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
