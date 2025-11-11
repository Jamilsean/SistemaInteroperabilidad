import { Navigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { refreshOnce } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

function FullScreenSpinner() {
  return <div className="min-h-[60vh] grid place-items-center">Verificando sesión…</div>;
}

export const ProtectedRoute: React.FC = () => {
  const [status, setStatus] = React.useState<"checking"|"ok"|"fail">("checking");
  const location = useLocation();
  const ctx = React.useContext(AuthContext);
  const hasUser = !!ctx?.user;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await refreshOnce();
        if (cancelled) return;
        if (resp === null) { setStatus(hasUser ? "ok" : "fail"); return; }

        const payload = (resp as any).data ?? resp;
        if (!payload?.user) throw new Error("no-session");
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus("fail");
      }
    })();
    return () => { cancelled = true; };
  }, [hasUser]);

  if (status === "checking") return <FullScreenSpinner />;

  if (status === "fail") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?expired=1&next=${next}`} replace />;
  }
  return <Outlet />;
};