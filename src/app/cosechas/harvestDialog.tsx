import { useEffect, useState } from "react";
import { startHarvest, } from "@/services/harvestService";
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
import type { Repositorios } from "@/types/repositorios";

type Props = {
    onDone?: () => void;   
};


export default function HarvestDialog({ onDone }: Props) {

    const [tipos, setTipos] = useState<Repositorios[]>([])
    const [repo, setRepo] = useState<string>("")
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listRepositorios();
                setTipos(data);

            } catch (error) {
                console.error("Error al cargar tipos de recursos:", error)
            }
        }
        fetchData()
    }, [])



    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repo) {
            setErrorMsg("Selecciona un repositorio.");
            return;
        }
        setErrorMsg("");
        setSubmitting(true);
        try {
            await startHarvest(repo);
            onDone?.();
            
            const closeBtn = document.getElementById("harvest-dialog-close");
            closeBtn?.click();


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
        <Dialog>

            <DialogTrigger asChild>
                <Button size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Realizar cosecha</DialogTitle>
                    <DialogDescription>
                        Selecciona el repositorio y lanza la cosecha.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="repo">Repositorio</Label>
                            <Select onValueChange={(v) => setRepo(v.toLowerCase())}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Selecciona repositorio" />
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
