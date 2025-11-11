"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { nombre_institucion, nombre_sistema, REDIRECT_SSO } from "@/config/env";
import { toast } from "sonner";
import { parseAxiosError } from "@/lib/http-error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  const location = useLocation();
  const navigate = useNavigate();
  const { login: loginAuth, user, loading } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";


  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);


  const handleOAuth = useCallback(() => {
    setOauthError(null);
    setLoadingOAuth(true);
    window.location.assign(REDIRECT_SSO);
  }, []);

  // Errores que vengan del callback OAuth
  useEffect(() => {
    const st = location.state as any;
    const msg = st?.authError as string | undefined;
    if (msg) {
      setOauthError(msg);
      toast.error(msg);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleLogin = async () => {
    if (submitting) return;
    setErrorMsg(null);
    setFieldErrors(undefined);
    setSubmitting(true);

    try {
      await loginAuth(email.trim(), password);
    } catch (err: any) {
      const errInfo = parseAxiosError(err);

      const details = errInfo.errors
        ? Object.entries(errInfo.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" • ") : String(v)}`)
          .join("\n")
        : undefined;

      // toast.error(
      //   errInfo.status === 403 ? "Usuario no activo" : `Error ${errInfo.status || ""}`.trim(),
      //   { description: details || errInfo.message, duration: 6000 }
      // );

      setErrorMsg(details ? `${errInfo.message}\n${details}` : errInfo.message);
      setFieldErrors(errInfo.errors);
      // console.log("errorMsg state set to:", details ? `${errInfo.message}\n${details}` : errInfo.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-2">
      <div className="w-full max-w-md px-2">
        <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="p-1 rounded-xl flex items-center">
                <img className="w-12 h-12" src="/images/Logo.png" alt="" />
                <h1 className="text-sm text-center uppercase text-gray-900">
                  {nombre_institucion}
                </h1>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Iniciar Sesión
              </CardTitle>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleOAuth}
                disabled={loadingOAuth}
              >
                {loadingOAuth ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                <span className="inline-flex items-center gap-2">
                  <img src="/images/Logo.png" alt="INAIGEM" className="h-4 w-4" />
                  INAIGEM INTRANET
                </span>
              </Button>

              {oauthError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm"
                >
                  {oauthError}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Usuario
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="usuario@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {fieldErrors?.email && (
                <p className="text-sm text-red-600">{fieldErrors.email.join(" • ")}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="**********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant={"blue"}
                    onClick={handleLogin}
                    disabled={submitting}
                    className="w-full mt-2"
                  >
                    {submitting ? "Ingresando…" : "Entrar"}
                  </Button>
                </div>
                {errorMsg && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mt-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 whitespace-pre-line"
                  >
                    {errorMsg}
                  </div>
                )}
              </div>
            </form>
          </CardContent>

        </Card>

        <div className="mt-10 text-center text-sm text-gray-500">
          <p className="my-2">© 2025 {nombre_sistema}. Todos los derechos reservados.</p>

          <Link to="/landingpage" className="bg-celeste px-3 py-2 rounded-sm text-gray-700 hover:text-foreground transition-colors">
            <span className="inline-flex items-center gap-2">
              <img src="/images/Logo.png" alt="INAIGEM" className="h-4 w-4" />
              Ver Plataforma
            </span>
          </Link>



        </div>
      </div>
    </div>
  );
}
