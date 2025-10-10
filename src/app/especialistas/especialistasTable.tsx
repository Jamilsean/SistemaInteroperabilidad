"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Plus, Trash2, CheckCircle, Edit2, Search } from "lucide-react"

import { createEspecialista, deleteEspecialista, getEspecialistas, updateEspecialista } from "@/services/especialistaService"
import type { Especialista, EspecialistaListResponse, EspecialistaUpsertPayload } from "@/types/especialistas"
import { toast } from "sonner"
import { parseAxiosError } from "@/lib/http-error"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

const initialForm: EspecialistaUpsertPayload = { nombres: "", apellidos: "", email: "" };
export default function EspecialistasTable() {
   // list states
  const [rows, setRows] = useState<Especialista[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // sort básico (puedes mejorarlo)
  const [sortBy, setSortBy] = useState<"nombres" | "apellidos" | "email" | "created_at" | "updated_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // form states
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<EspecialistaUpsertPayload>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const isEditing = useMemo(() => editingId !== null, [editingId]);

  // delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const lastPage = useMemo(() => {
    if (!total || !perPage) return 1;
    return Math.max(1, Math.ceil(Number(total) / Number(perPage)));
  }, [total, perPage]);

  async function fetchList(page = currentPage) {
    setLoading(true);
    try {
      const res: EspecialistaListResponse = await getEspecialistas({
        page,
        per_page: perPage,
        search: search.trim() || null,
        search_in: "nombres",
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setRows(res.data);
      setTotal(Number(res.total));
      setCurrentPage(res.current_page);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo cargar la lista de especialistas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, sortBy, sortDir]); // cambia página a 1 si cambian filtros globales

  // ---- crear / editar ----
  // const openCreate = () => {
  //   setEditingId(null);
  //   setForm(initialForm);
  //   setOpenForm(true);
  // };

  const openEdit = (row: Especialista) => {
    setEditingId(row.id);
    setForm({ nombres: row.nombres, apellidos: row.apellidos, email: row.email });
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    // validación mínima
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.email.trim()) {
      toast.error("Completa nombres, apellidos y email.");
      return;
    }
    try {
      if (isEditing && editingId) {
        await updateEspecialista(editingId, {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
        });
        toast.success("Especialista actualizado correctamente.", {
          icon: <CheckCircle className="text-green-500" />,
        });
      } else {
        await createEspecialista({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
        });
        toast.success("Especialista creado correctamente.", {
          icon: <CheckCircle className="text-green-500" />,
        });
      }
      setOpenForm(false);
      setEditingId(null);
      setForm(initialForm);
      // refetch sin bloquear el toast
      void fetchList(isEditing ? currentPage : 1);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || (isEditing ? "No se pudo actualizar" : "No se pudo crear"));
    }
  };

  // ---- eliminar ----
  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEspecialista(deleteId);
      toast.success("Registro eliminado correctamente.", {
        icon: <CheckCircle className="text-green-500" />,
      });

      // si la página queda vacía tras eliminar, retrocede una página
      const nextPage = rows.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setOpenDelete(false);
      setDeleteId(null);
      void fetchList(nextPage);
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo eliminar el especialista");
    }
  };


  return (
     <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre, apellido o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchList(1)}
          />
        </div>

        <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Per page" />
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

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="nombres">Nombres</SelectItem>
              <SelectItem value="apellidos">Apellidos</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="created_at">Creado</SelectItem>
              <SelectItem value="updated_at">Actualizado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button onClick={() => fetchList(1)} disabled={loading}>
          Buscar
        </Button>

        <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) { setEditingId(null); setForm(initialForm); } }}>
          <DialogTrigger asChild>
            <Button variant="default" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo especialista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar especialista" : "Nuevo especialista"}</DialogTitle>
              <DialogDescription>
                Completa los campos y guarda los cambios.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={form.nombres}
                  onChange={(e) => setForm((p) => ({ ...p, nombres: e.target.value }))}
                  placeholder="Nombres completos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={form.apellidos}
                  onChange={(e) => setForm((p) => ({ ...p, apellidos: e.target.value }))}
                  placeholder="Apellidos completos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="especialista@empresa.com"
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {isEditing ? "Guardar cambios" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">ID</TableHead>
              <TableHead>Nombres</TableHead>
              <TableHead>Apellidos</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">#{r.id}</TableCell>
                <TableCell>{r.nombres}</TableCell>
                <TableCell>{r.apellidos}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell className="text-xs">{formatDateTime(r.created_at)}</TableCell>
                <TableCell className="text-xs">{formatDateTime(r.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <AlertDialog open={openDelete && deleteId === r.id} onOpenChange={setOpenDelete}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => confirmDelete(r.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar especialista</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. ¿Deseas eliminar al especialista <b>{r.nombres} {r.apellidos}</b>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!rows.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                  {loading ? "Cargando…" : "No se encontraron especialistas"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación muy simple */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {lastPage} • Total: {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || loading}
            onClick={() => fetchList(currentPage - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage || loading}
            onClick={() => fetchList(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
