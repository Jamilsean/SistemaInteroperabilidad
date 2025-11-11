"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info } from "lucide-react";

import { getVotoDetalle, registrarVoto } from "@/services/votoService";
import type { VotoDetalleResponse } from "@/types/voto";
import { parseAxiosError } from "@/lib/http-error";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="col-span-2 font-medium break-words">{value ?? "-"}</div>
    </div>
  );
}

export default function VotoPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<VotoDetalleResponse | null>(null);
  const [justificacion, setJustificacion] = useState("");

  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getVotoDetalle(token);
        setDetalle(data);
      } catch (e: any) {
        const err = parseAxiosError(e);
        toast.error(err.message || "No se pudo obtener el detalle del voto");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleAceptar = async () => {
    if (!token) return;
    try {
      // Según tu especificación: ACEPTAR envía voto = "0"
      await registrarVoto(token, { voto: "0", justificacion });
      toast.success("Voto registrado correctamente", {
        icon: <CheckCircle2 className="text-green-600" />,
      });
      navigate("/", { replace: true });
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo registrar el voto");
    }
  };

  const handleDenegar  = async () => {
    if (!token) return;
    try {
      // Según tu especificación: ACEPTAR envía voto = "0"
      await registrarVoto(token, { voto: "1", justificacion });
      toast.success("Voto registrado correctamente", {
        icon: <CheckCircle2 className="text-green-600" />,
      });
      navigate("/", { replace: true });
    } catch (e: any) {
      const err = parseAxiosError(e);
      toast.error(err.message || "No se pudo registrar el voto");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const yaVoto = detalle?.aprobacion?.ya_voto;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Validación de relación</h1>
        <Badge variant="outline" className="gap-1">
          <Info className="h-3.5 w-3.5" />
          Token
        </Badge>
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {token?.slice(0, 10)}…
        </code>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de la relación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detalle ? (
            <>
              <div className="grid gap-2">
                <Row label="Nro de Relación" value={detalle.relacion?.id} />
                <Row label="Tipo" value={detalle.relacion?.tipo} />
                <CardContent className="border-2 rounded-xl py-2">
                  <Row label="Repositorio Origen" value={detalle.relacion?.origen} />

                  <a className="text-blue-600  hover:text-blue-900" href={detalle.relacion?.persistent_uri_origen} target="_blank">
                    <img
                      src={detalle.relacion?.url_image_origen}
                      alt={detalle.relacion?.url_image_origen}
                      className=" h-40 object-cover "
                    />Ir al repositorio</a>
                </CardContent>

                <CardContent className="border-2 rounded-xl py-2">
                  <Row label="Repositorio Destino" value={detalle.relacion?.destino} />
                  <a className="text-blue-600  hover:text-blue-900" href={detalle.relacion?.persistent_uri_destino} target="_blank">
                    <img
                      src={detalle.relacion?.url_image_destino}
                      alt={detalle.relacion?.url_image_destino}
                      className=" h-40 object-cover"
                    />Ir al repositorio</a>
                  <Row label="Comentario" value={detalle.relacion?.comentario} />
                </CardContent>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado de aprobación</span>
                  {yaVoto ? (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      Ya votó
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pendiente</Badge>
                  )}
                </div>
                {yaVoto && (
                  <div className="text-sm">
                    <div><span className="text-muted-foreground">Voto:</span> <b>{detalle.aprobacion.voto}</b></div>
                    <div><span className="text-muted-foreground">Justificación:</span> {detalle.aprobacion.justificacion || "-"}</div>
                  </div>
                )}
              </div>

              {!yaVoto && (
                <div className="space-y-3">
                  <label htmlFor="justificacion" className="text-sm font-medium">
                    Justificación (requerida para aceptar)
                  </label>
                  <Textarea
                    id="justificacion"
                    placeholder="Escriba su justificación…"
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleAceptar}
                      disabled={!justificacion.trim()}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aceptar
                    </Button>
                    <Button variant="outline" onClick={handleDenegar} className="gap-2">
                      <XCircle className="h-4 w-4" />
                      Denegar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Al <b>Aceptar</b>, se registrará su voto con el token recibido. Al <b>Denegar</b>, simplemente se regresará a la página principal.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No hay información disponible para este token o ya expiró.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
