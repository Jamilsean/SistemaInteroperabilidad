// routes/PublicOnlyRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const PublicOnlyRoute = () => {
  const { user } = useAuth(); 
  const location = useLocation();

  if (user) {
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
};