// src/app/usuarios/UserTable.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { parseAxiosError } from "@/lib/http-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getUsuarios, toggleUsuarioStatus, registerUsuario } from "@/services/userService";
import type { Usuario } from "@/types/user";
import { Loader2, Search, UserPlus, ShieldCheck, Shield, X } from "lucide-react";

import {
  getUserRolesPermissions,
  listAllPermissions,
  listAllRoles,
  assignUserRole,
  removeUserRole,
  giveUserPermission,
  revokeUserPermission,
} from "@/services/roleUserService";
import type { Permission, Role } from "@/types/roleUser";
import { useAuthZ } from "@/hooks/useAuthZ";

export default function UserTable() {
  const { can } = useAuthZ();
  // ---------- Filtros existentes ----------
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [searchIn, setSearchIn] = React.useState("name,is_active,email");
  const [sortBy, setSortBy] = React.useState<"id" | "is_active" | "email_verified_at" | "email" | "created_at" | "updated_at" | undefined>(undefined);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc" | undefined>(undefined);

  // ---------- Datos tabla ----------
  const [rows, setRows] = React.useState<Usuario[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // ---------- Crear usuario (modal) ----------
  const [openCreate, setOpenCreate] = React.useState(false);
  const [cName, setCName] = React.useState("");
  const [cEmail, setCEmail] = React.useState("");
  const [cPassword, setCPassword] = React.useState("");
  const [cPassword2, setCPassword2] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // ---------- Gestión Roles/Permisos (modal) ----------
  const [openManage, setOpenManage] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);

  // catálogos
  const [allRoles, setAllRoles] = React.useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = React.useState<Permission[]>([]);

  // detalle actual del usuario
  const [userRoles, setUserRoles] = React.useState<string[]>([]);
  const [userPerms, setUserPerms] = React.useState<string[]>([]);
  const [loadingManage, setLoadingManage] = React.useState(false);
  const [addingPerm, setAddingPerm] = React.useState<string | undefined>(undefined);

  // ---------- Fetch tabla ----------
  const fetchData = React.useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getUsuarios({
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        search_in: searchIn,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setRows(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [perPage, search, searchIn, sortBy, sortDir]);

  React.useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleApplyFilters = async () => {
    await fetchData(1);
  };

  // const handlePageChange = async (page: number) => {
  //   if (page >= 1 && page <= lastPage) await fetchData(page);
  // };

  const handleToggle = async (u: Usuario) => {
    try {
      await toggleUsuarioStatus(u.id);
      toast.success(`Usuario ${u.is_active ? "desactivado" : "activado"} correctamente`);
      await fetchData(currentPage);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cambiar el estado");
    }
  };

  const handleCreate = async () => {
    if (!cName.trim() || !cEmail.trim() || !cPassword) {
      toast.error("Completa nombre, correo y contraseña");
      return;
    }
    if (cPassword !== cPassword2) {
      toast.error("La confirmación no coincide");
      return;
    }
    setCreating(true);
    try {
      const res = await registerUsuario({
        name: cName.trim(),
        email: cEmail.trim(),
        password: cPassword,
        password_confirmation: cPassword2,
      });
      toast.success(res?.message || "Usuario creado correctamente");
      setOpenCreate(false);
      setCName(""); setCEmail(""); setCPassword(""); setCPassword2("");
      await fetchData(1);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo registrar");
    } finally {
      setCreating(false);
    }
  };

  // ---------- Gestión Roles/Permisos ----------
  const openManageFor = async (u: Usuario) => {
    setSelectedUser(u);
    setOpenManage(true);
    setLoadingManage(true);
    try {
      // catálogos (cárgalos 1 vez por sesión del componente)
      if (!allRoles.length) {
        const rolesRes = await listAllRoles(100);
        setAllRoles(rolesRes.data);
      }
      if (!allPermissions.length) {
        const permsRes = await listAllPermissions();
        setAllPermissions(permsRes.data);
      }
      // detalle usuario
      const detail = await getUserRolesPermissions(u.id);
      setUserRoles(detail.data.roles || []);
      setUserPerms(detail.data.permissions || []);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar roles/permisos del usuario");
      setOpenManage(false);
    } finally {
      setLoadingManage(false);
    }
  };

  const toggleRole = async (roleName: string, checked: boolean) => {
    if (!selectedUser) return;
    try {
      if (checked) {
        await assignUserRole(selectedUser.id, roleName);
        setUserRoles((prev) => Array.from(new Set([...prev, roleName])));
        toast.success(`Rol "${roleName}" asignado`);
      } else {
        await removeUserRole(selectedUser.id, roleName);
        setUserRoles((prev) => prev.filter((r) => r !== roleName));
        toast.success(`Rol "${roleName}" removido`);
      }
      fetchData(1);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo actualizar el rol");
    }

  };

  const addPermission = async () => {
    if (!selectedUser || !addingPerm) return;
    const perm = addingPerm;
    setAddingPerm(undefined);
    try {
      await giveUserPermission(selectedUser.id, perm);
      setUserPerms((prev) => Array.from(new Set([...prev, perm])));
      toast.success(`Permiso "${perm}" asignado`);
      fetchData(1);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo asignar el permiso");
    }
  };

  const removePermission = async (perm: string) => {
    if (!selectedUser) return;
    try {
      await revokeUserPermission(selectedUser.id, perm);
      setUserPerms((prev) => prev.filter((p) => p !== perm));
      toast.success(`Permiso "${perm}" revocado`);
      fetchData(1);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo revocar el permiso");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-xl font-semibold">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">Busca, crea y administra el estado, roles y permisos de los usuarios.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Tabla de usuarios</CardDescription>

          {/* Crear usuario */}
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              {can({ anyOf: ["users.create"] }) && (
                <Button variant="success" className="ml-auto gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nuevo usuario
                </Button>)}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar usuario</DialogTitle>
                <DialogDescription>Completa los datos del nuevo usuario.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cname">Nombre</Label>
                  <Input id="cname" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Nombre Apellido" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cemail">Correo</Label>
                  <Input id="cemail" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="usuario@empresa.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpass">Contraseña</Label>
                  <Input id="cpass" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpass2">Confirmación</Label>
                  <Input id="cpass2" type="password" value={cPassword2} onChange={(e) => setCPassword2(e.target.value)} placeholder="••••••••" />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                <Button variant={"success"} onClick={handleCreate} disabled={creating}>
                  {creating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</span> : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative">
              <Label className="mb-1 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 w-64"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block">Buscar en</Label>
              <Select value={searchIn} onValueChange={setSearchIn}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="name,is_active,email">Todos</SelectItem>
                    <SelectItem value="name">name</SelectItem>
                    <SelectItem value="email">email</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Ordenar por</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="(sin ordenar)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="id">ID</SelectItem>
                    <SelectItem value="email">Correo</SelectItem>
                    <SelectItem value="is_active">Activos</SelectItem>
                    <SelectItem value="created_at">Fecha creación</SelectItem>
                    <SelectItem value="updated_at">Fecha edición</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Dirección</Label>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="asc/desc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="asc">asc</SelectItem>
                    <SelectItem value="desc">desc</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block">Por página</Label>
              <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button variant={"blue"} onClick={handleApplyFilters} disabled={loading}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Buscando…</span> : "Aplicar"}
            </Button>
          </div>

          {/* Tabla */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{u.roles?.length || 0}</TableCell>
                    <TableCell>{u.permissions?.length || 0}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {can({ anyOf: ["users.update"] }) && (<Button size="sm" variant="secondary" onClick={() => handleToggle(u)}>
                        {u.is_active ? "Desactivar" : "Activar"}
                      </Button>)}
                      <Button size="sm" variant="outline" onClick={() => openManageFor(u)}>
                        <Shield className="h-4 w-4 mr-1" /> Roles/Permisos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {loading ? "Cargando…" : "Sin resultados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage}
            </div>
            {/* … tu paginación existente … */}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Roles/Permisos */}
      <Dialog open={openManage} onOpenChange={setOpenManage}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Roles & Permisos del usuario</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ""}
            </DialogDescription>
          </DialogHeader>

          {loadingManage ? (
            <div className="py-12 grid place-items-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Cargando…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Roles */}
              {can({ anyOf: ["users.assign-role"] }) && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Roles</h4>

                  <ScrollArea className="h-64 rounded-md border p-3">
                    <div className="space-y-2">
                      {allRoles.map((r) => {
                        const isAdmin = r.name === "admin" || r.id === 1;
                        const checked = userRoles.includes(r.name);
                        return (
                          <label key={r.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              disabled={isAdmin} // no toques admin
                              onChange={(e) => toggleRole(r.name, e.target.checked)}
                            />
                            <span className="text-sm">
                              <span className="font-medium">{r.display_name || r.name}</span>
                              {isAdmin && <Badge className="ml-2">protegido</Badge>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
              {/* Columna Permisos */}
              <div className="space-y-3">
                <h4 className="font-semibold">Permisos directos</h4>
                {can({ anyOf: ["users.give-permission"] }) && (
                  <div className="flex gap-2">
                    <Select value={addingPerm} onValueChange={setAddingPerm}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un permiso…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {allPermissions
                            .filter((p) => !userPerms.includes(p.name))
                            .map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.display_name || p.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button onClick={addPermission} disabled={!addingPerm}>Añadir</Button>
                  </div>
                )}

                <ScrollArea className="h-56 rounded-md border p-3">
                  {userPerms.length ? (
                    <div className="flex flex-wrap gap-2">
                      {userPerms.map((perm) => (
                        <Badge key={perm} variant="secondary" className="gap-1">
                          {perm}
                          {can({ anyOf: ["users.revoke-permission"] }) && (<button
                            className="ml-1 inline-flex"
                            onClick={() => removePermission(perm)}
                            title="Revocar"
                          >
                            <X className="h-3 w-3" />
                          </button>)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin permisos directos</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenManage(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
