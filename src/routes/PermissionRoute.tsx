// src/routes/PermissionRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { makeCan, type CanOptions } from "@/lib/authz";

export function PermissionRoute(props: CanOptions) {
  const { user, permissions = [], roles = [], loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div style={{display:"grid",placeItems:"center",minHeight:"100dvh"}}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  const { can } = makeCan(permissions, roles);
  if (!can(props)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}