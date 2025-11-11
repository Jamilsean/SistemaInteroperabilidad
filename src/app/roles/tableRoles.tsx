// src/app/roles/RolesManager.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { parseAxiosError } from "@/lib/http-error";
import { listRoles, listPermissions, createRole, updateRole, deleteRole, getRole } from "@/services/roleService";
import type { Permission, Role, GetRolesParams, CreateRolePayload, UpdateRolePayload } from "@/types/role";
import { Plus, Shield, Search, Pencil, Eye, Trash2, RefreshCcw } from "lucide-react";
import { useAuthZ } from "@/hooks/useAuthZ";

const defaultParams: GetRolesParams = {
  page: 1,
  per_page: 10,
  search: "",
  search_in: "name,guard_name",
  sort_by: "id",
  sort_dir: "asc",
};

export default function TableIRecursos() {
  const { can } = useAuthZ();
  // ------- filtros y paginación -------
  const [params, setParams] = React.useState<GetRolesParams>(defaultParams);

  // ------- datos -------
  const [loading, setLoading] = React.useState(false);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [total, setTotal] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);

  // permisos globales
  const [allPerms, setAllPerms] = React.useState<Permission[]>([]);
  const [loadingPerms, setLoadingPerms] = React.useState(false);

  // ------- crear/editar -------
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editing, setEditing] = React.useState<Role | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formDisplay, setFormDisplay] = React.useState("");
  const [formDesc, setFormDesc] = React.useState<string>("");
  const [formPerms, setFormPerms] = React.useState<string[]>([]);
  const isEditing = !!editing;

  // ------- ver permisos -------
  const [openView, setOpenView] = React.useState(false);
  const [viewRole, setViewRole] = React.useState<Role | null>(null);

  // cargar permisos globales 1 vez
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingPerms(true);
        const p = await listPermissions();
        setAllPerms(p);
      } catch (e) {
        const err = parseAxiosError(e);
        toast.error(err.message || "No se pudieron cargar los permisos");
      } finally {
        setLoadingPerms(false);
      }
    })();
  }, []);

  // cargar roles cuando cambien parámetros
  const fetchRoles = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await listRoles(params);
      setRoles(res.data);
      setTotal(res.pagination.total);
      setCurrentPage(res.pagination.current_page);
      setLastPage(res.pagination.last_page);
    } catch (e) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudieron cargar los roles");
    } finally {
      setLoading(false);
    }
  }, [params]);

  React.useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // helpers
  const resetForm = () => {
    setEditing(null);
    setFormName("");
    setFormDisplay("");
    setFormDesc("");
    setFormPerms([]);
  };

  const openCreate = () => {
    resetForm();
    setOpenEdit(true);
  };

  const openEditRole = async (r: Role) => {
    try {
      const full = await getRole(r.id); // asegúrate de traer permisos actualizados
      setEditing(full);
      setFormName(full.name);
      setFormDisplay(full.display_name || "");
      setFormDesc(full.description || "");
      setFormPerms(full.permissions.map(p => p.name));
      setOpenEdit(true);
    } catch (e) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar el rol");
    }
  };

  const submitForm = async () => {
    try {
      if (!isEditing && !formName.trim()) {
        toast.error("El nombre (slug) es obligatorio");
        return;
      }
      if (!formDisplay.trim()) {
        toast.error("El nombre visible es obligatorio");
        return;
      }

      if (isEditing && editing) {
        const payload: UpdateRolePayload = {
          display_name: formDisplay.trim(),
          description: formDesc || null,
          permissions: formPerms,
        };
        await updateRole(editing.id, payload);
        toast.success("Rol actualizado correctamente");
      } else {
        const payload: CreateRolePayload = {
          name: formName.trim(),
          display_name: formDisplay.trim(),
          description: formDesc || null,
          permissions: formPerms,
        };
        await createRole(payload);
        toast.success("Rol creado correctamente");
      }

      setOpenEdit(false);
      resetForm();
      fetchRoles();
    } catch (e) {
      const err = parseAxiosError(e);
      toast.error(err.message || (isEditing ? "No se pudo actualizar el rol" : "No se pudo crear el rol"), {
        description: err.errors ? Object.entries(err.errors).map(([k, v]) => `${k}: ${v.join(" • ")}`).join("\n") : undefined,
      });
    }
  };

  const confirmDelete = async (r: Role) => {
    if (!confirm(`¿Eliminar el rol "${r.display_name}"?`)) return;
    try {
      await deleteRole(r.id);
      toast.success("Rol eliminado");
      fetchRoles();
    } catch (e) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo eliminar");
    }
  };

  const togglePerm = (permName: string, checked: boolean | string) => {
    const on = checked === true;
    setFormPerms((prev) => (on ? [...new Set([...prev, permName])] : prev.filter(p => p !== permName)));
  };

  // UI: filtros reactivamente (cambia y dispara fetch por useEffect)
  const handleParam = <K extends keyof GetRolesParams>(key: K, value: GetRolesParams[K]) => {
    setParams((p) => ({ ...p, page: 1, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Gestión de Roles
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchRoles()} disabled={loading}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
            {can({ anyOf: ["roles.create"] }) && ( <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo rol
            </Button>)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Controles de búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="name o guard_name"
                  value={params.search ?? ""}
                  onChange={(e) => handleParam("search", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 ">
              <Label>Ordenar por</Label>
              <Select
                value={params.sort_by ?? "id"}
                onValueChange={(v) => handleParam("sort_by", v as GetRolesParams["sort_by"])}
              >
                <SelectTrigger><SelectValue placeholder="Campo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Nro rol</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="guard_name">guard_name</SelectItem>
                  <SelectItem value="created_at">Creación</SelectItem>
                  <SelectItem value="updated_at">Actualización</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label>Dirección</Label>
                <Select
                  value={params.sort_dir ?? "asc"}
                  onValueChange={(v) => handleParam("sort_dir", v as "asc" | "desc")}
                >
                  <SelectTrigger><SelectValue placeholder="asc/desc" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">asc</SelectItem>
                    <SelectItem value="desc">desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 space-y-2">
                <Label>Por página</Label>
                <Select
                  value={String(params.per_page ?? 10)}
                  onValueChange={(v) => handleParam("per_page", Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Display</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead className="w-[220px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.display_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[520px]">
                        {r.permissions.slice(0, 6).map(p => (
                          <Badge key={p.id} variant="secondary">{p.name}</Badge>
                        ))}
                        {r.permissions.length > 6 && (
                          <Badge variant="outline">+{r.permissions.length - 6}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        const full = await getRole(r.id);
                        setViewRole(full);
                        setOpenView(true);
                      }}>
                        <Eye className="h-4 w-4 mr-1" /> Ver permisos
                      </Button>
                      {can({ anyOf: ["roles.update"] }) && ( <Button size="sm" onClick={() => openEditRole(r)}>
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>)}
                      {can({ anyOf: ["roles.delete"] }) && (
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(r)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>)}
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && roles.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin resultados</TableCell></TableRow>
                )}
                {loading && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando…</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación simple */}
          <div className="flex justify-between items-center text-sm">
            <div>Total: {total}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setParams((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
              >
                Anterior
              </Button>
              <div className="px-2 grid place-items-center">Página {currentPage} / {lastPage}</div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => setParams((p) => ({ ...p, page: Math.min(lastPage, (p.page ?? 1) + 1) }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog crear/editar */}
      <Dialog open={openEdit} onOpenChange={(o) => { setOpenEdit(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar rol" : "Nuevo rol"}</DialogTitle>
            <DialogDescription>
              Define los datos del rol y selecciona los permisos que tendrá.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre (slug)</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="admin, editor…" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="display">Nombre visible</Label>
              <Input id="display" value={formDisplay} onChange={(e) => setFormDisplay(e.target.value)} placeholder="Administrador" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Input id="desc" value={formDesc ?? ""} onChange={(e) => setFormDesc(e.target.value)} placeholder="Opcional" />
            </div>

            <div className="md:col-span-2">
              <Label>Permisos</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-auto rounded border p-3">
                {allPerms.map((perm) => {
                  const checked = formPerms.includes(perm.name);
                  return (
                    <label key={perm.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={checked} onCheckedChange={(v) => togglePerm(perm.name, v)} />
                      <span className="font-mono">{perm.display_name}</span>
                    </label>
                  );
                })}
                {!loadingPerms && allPerms.length === 0 && (
                  <div className="text-muted-foreground text-sm">No hay permisos definidos.</div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button onClick={submitForm}>{isEditing ? "Guardar cambios" : "Crear rol"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ver permisos */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permisos del rol</DialogTitle>
            <DialogDescription>
              {viewRole ? `${viewRole.display_name} (${viewRole.name})` : "Cargando…"}
            </DialogDescription>
          </DialogHeader>
          {viewRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {viewRole.permissions.map((p) => (
                <Badge key={p.id} variant="secondary" className="justify-start">{p.display_name}</Badge>
              ))}
              {viewRole.permissions.length === 0 && (
                <div className="text-sm text-muted-foreground">Sin permisos asignados.</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenView(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
