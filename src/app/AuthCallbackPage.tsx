// src/app/AuthCallbackPage.tsx
import * as React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallbackPage() {
  const ranRef = React.useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { loginWithSSO, user, loading } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    const tokenFromQuery = params.get("token");
    if (!tokenFromQuery) {
      toast.error("Falta el parámetro 'token' en la URL");
      navigate("/login", { replace: true });
      return;
    }

    const key = `SSO_token_${tokenFromQuery}`;
    if (ranRef.current || sessionStorage.getItem(key) === "done") return;
    ranRef.current = true;

    (async () => {
      try {
        await loginWithSSO(tokenFromQuery);
        sessionStorage.setItem(key, "done");
        toast.success("Autenticación exitosa");
        navigate(from, { replace: true });
      } catch (err: any) {
        const api = err?.response?.data;
        navigate("/login", { replace: true, state: { authError: api?.message || "No se pudo iniciar sesión" } });
      }
    })();
  }, [params, loginWithSSO, navigate, from, location.state]);

  React.useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Procesando autenticación…
      </div>
    </div>
  );
}
