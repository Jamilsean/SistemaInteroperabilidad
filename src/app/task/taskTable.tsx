"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Save, Power, PowerOff } from "lucide-react";
import { getHarvestTasks, updateHarvestTask, toggleHarvestTask } from "@/services/taskService";
import { parseAxiosError } from "@/lib/http-error";
import { useAuthZ } from "@/hooks/useAuthZ";

const REPEAT_PRESETS = [
    { key: "daily", label: "Diario", days: 1 },
    { key: "weekly", label: "Semanal", days: 7 },
    { key: "monthly", label: "Mensual", days: 30 },
    { key: "quarterly", label: "Trimestral", days: 90 },
    { key: "semiannual", label: "Semestral", days: 182 },
    { key: "annual", label: "Anual", days: 365 },
    { key: "custom", label: "Personalizado", days: 0 },
];

function toDatetimeLocalInput(s: string): string {
    if (s.includes(" ")) {
        const [date, time] = s.split(" ");
        const hhmm = time?.slice(0, 5) ?? "00:00";
        return `${date}T${hhmm}`;
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
}

function toISOZFromLocal(localValue: string): string {
    const d = new Date(localValue);
    return d.toISOString();
}

type RowState = {
    id: number;
    startLocal: string;
    presetKey: string;
    customDays: number;
    repeat_every: number;
    is_active: boolean;
};

export default function TareasTable() {
    const { can } = useAuthZ();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<RowState[]>([]);

    const load = async () => {
        setLoading(true);
        try {
            const tasks = await getHarvestTasks();
            setRows(
                tasks.map<RowState & { repoName: string }>((t) => {
                    const preset = REPEAT_PRESETS.find((p) => p.days === t.repeat_every) ?? REPEAT_PRESETS[0];
                    return {
                        id: t.id,
                        startLocal: toDatetimeLocalInput(t.start_time),
                        presetKey: preset.key,
                        customDays: preset.key === "custom" ? t.repeat_every : 0,
                        repeat_every: t.repeat_every,
                        is_active: t.is_active,
                        repoName: t.repositorio,
                    };
                })
            );
        } catch (e: any) {
            const err = parseAxiosError(e);
            toast.error(err.message || "No se pudieron cargar las tareas programadas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handlePresetChange = (id: number, key: string) => {
        setRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                if (key === "custom") {
                    return { ...r, presetKey: key, repeat_every: Math.max(1, r.customDays || 1) };
                }
                const found = REPEAT_PRESETS.find((p) => p.key === key)!;
                return { ...r, presetKey: key, repeat_every: found.days };
            })
        );
    };

    const handleCustomDaysChange = (id: number, value: string) => {
        const num = Math.max(1, Number(value) || 1);
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, customDays: num, repeat_every: num } : r))
        );
    };

    const handleStartChange = (id: number, value: string) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, startLocal: value } : r)));
    };

    const handleSave = async (row: RowState) => {
        try {
            const payload = {
                start_time: toISOZFromLocal(row.startLocal),
                repeat_every: row.repeat_every,
            };
            await updateHarvestTask(row.id, payload);
            toast.success("Tarea actualizada correctamente", {
                icon: <CheckCircle2 className="text-green-600" />,
            });
            await load();
        } catch (e: any) {
            const err = parseAxiosError(e);
            toast.error(err.message || "No se pudo actualizar la tarea");
        }
    };

    const handleToggle = async (row: RowState) => {
        try {
            const updated = await toggleHarvestTask(row.id);
            setRows((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, is_active: updated.is_active } : r))
            );
            toast.info(updated.is_active ? "Tarea activada" : "Tarea desactivada");
        } catch (e: any) {
            const err = parseAxiosError(e);
            toast.error(err.message || "No se pudo cambiar el estado de la tarea");
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Tareas programadas</h1>
                    <Button variant="outline" disabled>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cargando…
                    </Button>
                </div>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Tareas programadas</h1>
                <Button variant="outline" onClick={load}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refrescar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Gestión de tareas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto scroll-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[160px]">Repositorio</TableHead>
                                    <TableHead className="min-w-[220px]">Inicio (fecha y hora)</TableHead>
                                    <TableHead className="min-w-[240px]">Frecuencia</TableHead>
                                    <TableHead className="min-w-[140px] text-center">Cada (días)</TableHead>
                                    <TableHead className="min-w-[120px] text-center">Estado</TableHead>
                                    <TableHead className="min-w-[220px] text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((r,) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.id}</TableCell>
                                        {/* Repositorio (solo display) */}
                                        {/* Inicio */}
                                        <TableCell>
                                            <Input
                                                type="datetime-local"
                                                value={r.startLocal}
                                                onChange={(e) => handleStartChange(r.id, e.target.value)}
                                            />
                                        </TableCell>


                                        {/* Frecuencia (preset) */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Select value={r.presetKey} onValueChange={(v) => handlePresetChange(r.id, v)}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Frecuencia" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {REPEAT_PRESETS.map((p) => (
                                                                <SelectItem key={p.key} value={p.key}>
                                                                    {p.label} {p.days ? `(${p.days}d)` : ""}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>

                                                {/* Personalizado: días */}
                                                {r.presetKey === "custom" && (
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={r.customDays || 1}
                                                        onChange={(e) => handleCustomDaysChange(r.id, e.target.value)}
                                                        className="w-24"
                                                    />
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Cada (días) */}
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{r.repeat_every}</Badge>
                                        </TableCell>

                                        {/* Estado */}
                                        <TableCell className="text-center">
                                            {r.is_active ? (
                                                <Badge className="bg-green-50 text-green-700 border-green-200" variant="secondary">Activo</Badge>
                                            ) : (
                                                <Badge variant="outline">Inactivo</Badge>
                                            )}
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {can({ anyOf: ["harvest_tasks.update"] }) && (
                                                    <Button variant="outline" size="sm" onClick={() => handleSave(r)}>
                                                        <Save className="h-4 w-4 mr-1" />
                                                        Guardar
                                                    </Button>
                                                )}
                                                {can({ anyOf: ["harvest_tasks.toggle"] }) && (
                                                    <Button
                                                        variant={r.is_active ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => handleToggle(r)}
                                                        className="gap-1"
                                                    >
                                                        {r.is_active ? (
                                                            <>
                                                                <PowerOff className="h-4 w-4" /> Desactivar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="h-4 w-4" /> Activar
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
