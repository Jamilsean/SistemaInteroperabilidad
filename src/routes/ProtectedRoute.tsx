import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { refreshOnce } from "@/lib/api";

function FullScreenSpinner() {
  return <div className="min-h-[60vh] grid place-items-center">Verificando sesión…</div>;
}
export const ProtectedRoute = () => {
  const [status, setStatus] = React.useState<"checking"|"ok"|"fail">("checking");
  const location = useLocation();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await refreshOnce();
        if (cancelled) return;
        if (!resp || !resp.data?.user) throw new Error("no-session");
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus("fail");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === "checking") return <FullScreenSpinner />;
  if (status === "fail") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?expired=1&next=${next}`} replace />;
  }
  return <Outlet />;
};