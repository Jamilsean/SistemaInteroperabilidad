// src/pages/NotFound.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/", { replace: true }), 10000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">No encontramos la página o el recurso solicitado.</p>
      <div className="flex gap-3">
        <Button asChild><Link to="/">Ir al inicio</Link></Button>
        <Button variant="outline" asChild><Link to="/login">Ir al inicio de sesión</Link></Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Te redirigiremos automáticamente en 10 segundos…</p>
    </div>
  );
}
