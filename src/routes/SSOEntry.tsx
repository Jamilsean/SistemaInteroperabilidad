// src/routes/SSOEntry.tsx
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function SSOEntry() {
  const [sp] = useSearchParams();
  const token = sp.get("token");
  const { user, loading } = useAuth();
  // 1) Si viene desde la plataforma externa ⇒ redirige a tu callback público
  if (token) {
    return (
      <Navigate
        to={`/auth/callback?token=${encodeURIComponent(token)}`}
        replace
      />
    );
  }

  // 2) Sin token en la URL: decide a dónde ir
  if (loading) {
    return <div style={{ padding: 16 }}>Verificando sesión:…</div>;
  }
  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}
