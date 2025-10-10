"use client";

import * as React from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { User2, Mail, Loader2, Lock } from "lucide-react";

import {
  getMe,
  updateMyPassword,
  updateMyProfile,
} from "@/services/profileService";
import type { MeUser, ValidationErrors } from "@/types/user";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function PerfilPage() {
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [changingPwd, setChangingPwd] = React.useState(false);
  const [me, setMe] = React.useState<MeUser | null>(null);

  // Profile form
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Password modal
  const [openPwd, setOpenPwd] = React.useState(false);
  const [current_password, setCurrentPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password_confirmation, setPasswordConfirmation] = React.useState("");
  const [pwdErrors, setPwdErrors] = React.useState<ValidationErrors | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setMe(data.user);
        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
      } catch (e: any) {
        const msg = e?.response?.data?.message || "No se pudo cargar el perfil";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateMyProfile({ name: name.trim(), email: email.trim() });
      toast.success(res?.message || "Perfil actualizado");
      // Opcional: refrescar user en UI
      if (me) setMe({ ...me, name: name.trim(), email: email.trim() });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 422) {
        const errs: ValidationErrors | undefined = e?.response?.data?.errors;
        const msg = e?.response?.data?.message || "Datos inválidos";
        toast.error(msg);
        // Puedes mostrar luego debajo de inputs si quieres
        console.warn("422 errors:", errs);
      } else {
        toast.error(e?.response?.data?.message || "No se pudo actualizar el perfil");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async () => {
    setChangingPwd(true);
    setPwdErrors(null);
    try {
      const res = await updateMyPassword({
        current_password,
        password,
        password_confirmation,
      });
      toast.success(res.message || "Contraseña actualizada correctamente");
      // Limpia y cierra
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setOpenPwd(false);
    } catch (e: any) {
      const status = e?.response?.status;
      const api = e?.response?.data;
      if (status === 422) {
        // Estructura de validación del backend:
        // { message: "...", errors: { current_password: ["..."], ... } }
        setPwdErrors(api?.errors || null);
        toast.error(api?.message || "Datos inválidos");
      } else if (status === 401) {
        toast.error(api?.message || "No autorizado");
      } else {
        toast.error(api?.message || "No se pudo actualizar la contraseña");
      }
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando perfil…
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-muted-foreground">
        No se pudo cargar la información del usuario.
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
              <BreadcrumbPage>Información de mi perfil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        
        <div>
          <h1 className="text-xl font-semibold">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus datos y tu seguridad.
          </p>
        </div>
      </div>

      {/* Datos básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
          <CardDescription>
            Información de tu cuenta (solo tú puedes verla).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="id">ID de usuario</Label>
              <Input id="id" value={me.id} disabled />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={me.is_active ? "Activo" : "Inactivo"} disabled />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <User2 className="h-4 w-4" /> Nombre
              </Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Correo
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant={"success"} onClick={submitProfile} disabled={savingProfile}>
              {savingProfile ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </span>
              ) : (
                "Guardar cambios"
              )}
            </Button>

            <Dialog open={openPwd} onOpenChange={setOpenPwd}>
              <DialogTrigger asChild>
                <Button variant="blue" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cambiar contraseña</DialogTitle>
                  <DialogDescription>
                    Por seguridad, ingresa la contraseña actual y tu nueva contraseña.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Contraseña actual</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={current_password}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    {pwdErrors?.current_password && (
                      <p className="text-xs text-red-600">
                        {pwdErrors.current_password.join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    {pwdErrors?.password && (
                      <p className="text-xs text-red-600">
                        {pwdErrors.password.join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={password_confirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••"
                    />
                    {pwdErrors?.password_confirmation && (
                      <p className="text-xs text-red-600">
                        {pwdErrors.password_confirmation.join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenPwd(false)}>
                    Cancelar
                  </Button>
                  <Button variant={"success"} onClick={submitPassword} disabled={changingPwd}>
                    {changingPwd ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                      </span>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
