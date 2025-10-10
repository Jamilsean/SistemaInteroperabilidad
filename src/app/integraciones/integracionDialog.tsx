import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { listRepositorios } from "@/services/repositorioService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listTiposRepositorios } from "@/services/tiposRecursoService";
import type { TipoRecurso } from "@/types/tipoRecurso";

import { getRecursos } from "@/services/recursosService";
import type { Recurso } from "@/types/recursos";
import type { Repositorios } from "@/types/repositorios";
import { parseAxiosError, type ServerError } from "@/lib/http-error";

type Props = {
    onDone?: () => void;   // opcional: para refrescar la tabla luego de la cosecha
};


export default function IntegracionDialog({ onDone }: Props) {
    const [, setTiposrecursos] = useState<TipoRecurso[]>([])

    const [open, setOpen] = useState(false);

    // VARIABLES DEL DATO ORIGEN
    const [titleOrigen, setTitleOrigen] = useState<string>("");
    const [recursoOrigen, setRecursoOrigen] = useState<Recurso[]>([]);
    const [repositorio_idOrigen, setRepositorio_idOrigen] = useState<number>(0)

    const [tipos, setTipos] = useState<Repositorios[]>([])
    // VARIABLES DEL DATO DESTINO
    const [titleDestino, setTitleDestino] = useState<string>("");
    // const [recursoDestino, setRecursoDestino] = useState<Recurso[]>([]);
    const [, setRepositorio_idDestino] = useState<number>(0)

    const [, setRepo] = useState<string>("")
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listRepositorios();
                setTipos(data);
                const dataTipos = await listTiposRepositorios();
                setTiposrecursos(dataTipos);
                const dataRecursos = await getRecursos();
                setRecursoOrigen(dataRecursos.data);
            } catch (error) {
                const err: ServerError = parseAxiosError(error);
                console.error(`Error ${err.status || ""}`.trim());
            }
        }
        fetchData()
    }, [])
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const data = await listTiposRepositorios();
    //             setTiposrecursos(data);

    //         } catch (error) {
    //             console.error("Error al cargar tipos de recursos:", error)
    //         }
    //     }
    //     fetchData()
    // }, [])


    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!repo) {
    //         setErrorMsg("Selecciona un repositorio.");
    //         return;
    //     }
    //     setErrorMsg("");
    //     setSubmitting(true);
    //     try {
    //         await startHarvest(repo);
    //         onDone?.();
    //         // Cerrar el diálogo “a mano” (truco con click al botón de close)
    //         const closeBtn = document.getElementById("harvest-dialog-close");
    //         closeBtn?.click();


    //     } catch (err: any) {
    //         const msg =
    //             err?.response?.data?.message ||
    //             (err?.response?.status ? `Error ${err.response.status}` : "Error de conexión");
    //         setErrorMsg(msg);
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };
    const handleBuscarOrigen = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSubmitting(true);
        // setRecursosLoading(true);
        try {
            // 1) Trae los recursos
            const data = await getRecursos(1, 20, [repositorio_idOrigen], titleOrigen);
            setRecursoOrigen(data.data);
            console.log(recursoOrigen);
            onDone?.();


        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                (err?.response?.status ? `Error ${err.response.status}` : "Error de conexión");
            setErrorMsg(msg);

        } finally {
            setSubmitting(false);

        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[325px] sm:w-[625px]  sm:max-w-[625px] ">
                <DialogHeader>
                    <DialogTitle>Realizar Integración</DialogTitle>
                    <DialogDescription>
                        Seleccionar el recurso orígen y el recurso destino
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4">
                    <div className="flex flex-col gap-3 overflow-auto sm:max-h-[625px]">
                        <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="text-lg">Recurso Origen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form action="">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div className="space-y-2">
                                            <Label htmlFor="sourceResource">Seleccionar recurso:</Label>
                                            <Select onValueChange={(v) => setRepositorio_idOrigen(Number(v))} >
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Selecciona repositorio" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {tipos.map((tipo) => (
                                                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                                {tipo.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                        </div>
                                        <div className="space-y-2 mt">
                                            <Label htmlFor="title">Título  Recurso Origen:</Label>
                                            <Input
                                                id="title"
                                                placeholder="Título del recurso origen..."
                                                value={titleOrigen}
                                                onChange={(e) => setTitleOrigen(e.target.value)}
                                            />
                                        </div>

                                    </div>
                                    <Button onClick={handleBuscarOrigen}>
                                        {submitting ? "buscando..." : "Iniciar cosecha"}
                                    </Button>
                                    <div className="grid col-span-2 gap-3 mt-3">
                                        <Label htmlFor="repo">Seleccionar recurso origen:</Label>
                                        <Select onValueChange={(v) => setRepo(v.toLowerCase())}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona recurso origen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {recursoOrigen.map((tipo) => (
                                                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                            {tipo.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="text-lg">Recurso Destino</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form action="">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div className="space-y-2">
                                            <Label htmlFor="sourceResource">Seleccionar recurso destino:</Label>
                                            <Select onValueChange={(v) => setRepositorio_idDestino(Number(v))}>
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Selecciona repositorio destino" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {tipos.map((tipo) => (
                                                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                            {tipo.nombre}
                                                        </SelectItem>
                                                    ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Título Recurso destino:</Label>
                                            <Input
                                                id="title"
                                                placeholder="Título del recurso destino..."
                                                value={titleDestino}
                                                onChange={(e) => setTitleDestino(e.target.value)}
                                            />
                                        </div>
                                        
                                    </div>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "buscando..." : "Iniciar cosecha"}
                                    </Button>
                                    <div className="grid col-span-2 gap-3">
                                        <Label htmlFor="repo">RECURSOS</Label>
                                        <Select onValueChange={(v) => setRepo(v.toLowerCase())}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona recurso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {recursoOrigen.map((tipo) => (
                                                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                            {tipo.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="grid gap-3">
                            <CardHeader>
                                <CardTitle className="text-lg">Recurso Destino</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form action="">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div className="space-y-2">
                                            <Label htmlFor="sourceResource">Seleccionar recurso destino:</Label>
                                            <Select onValueChange={(v) => setRepositorio_idOrigen(Number(v))}>
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Selecciona repositorio destino" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {tipos.map((tipo) => (
                                                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                                                                {tipo.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {repositorio_idOrigen}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Título Recurso destino:</Label>
                                            <Input
                                                id="title"
                                                placeholder="Título del recurso destino..."
                                                value={titleOrigen}
                                                onChange={(e) => setTitleOrigen(e.target.value)}
                                            />
                                        </div>
                                        {titleOrigen}
                                    </div>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "buscando..." : "Iniciar cosecha"}
                                    </Button>
                                    <div className="grid col-span-2 gap-3">
                                        <Label htmlFor="repo">RECURSOS</Label>
                                        <Select onValueChange={(v) => setRepo(v.toLowerCase())}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona recurso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {tipos.map((tipo) => (
                                                        <SelectItem key={tipo.id} value={tipo.nombre}>
                                                            {tipo.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                    </div>
                    {/* <p className="mt-4">
                        Valor seleccionado (minúscula): <strong>{repo}</strong>
                    </p> */}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button id="harvest-dialog-close" variant="outline" type="button">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Lanzando…" : "Iniciar cosecha"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

        </Dialog >
    );
}
