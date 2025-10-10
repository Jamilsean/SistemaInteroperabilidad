import { BrowserRouter, Routes, Route, Navigate, } from "react-router-dom";
import LoginPage from "@/app/login";
import MenuInicio from "@/app/page";
import { Cosechas } from "@/app/cosechas/cosecha";
import { Recursos } from "@/app/recursos/recursos";
import { Integraciones } from "@/app/integraciones/integraciones";
import { Usuarios } from "@/app/usuarios/usuarios";
import { Roles } from "@/app/roles/roles";
import { Especialistas } from "@/app/especialistas/especialistas";
import DashboardLayout from "@/app/dashboard";
import VotoPage from "@/app/voto/votoPage";
import { TareasProgramadasPage } from "@/app/task/taskPage";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import AuthCallbackPage from "@/app/AuthCallbackPage";
import { ProtectedRoute } from "./ProtectedRoute";
import SSOEntry from "./SSOEntry";
import LandingPage from "@/app/landingpage";
import PerfilPage from "@/app/perfil/PerfilPage";
import { PermissionRoute } from "./PermissionRoute";
import RecursoDetailPage from "@/app/landigPage/RecursoDetailPage";
import { Header } from "@/components/landing/header";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SSOEntry />} />
        <Route element={<Header />}>
          <Route path="/landingPage" element={<LandingPage />} />
          <Route path="/recursos/:id" element={<RecursoDetailPage />} />
        </Route>

        {/* <Route path="/recursos/:id" element={<RecursoDetailPage />} /> */}
        <Route path="/voto/:token" element={<VotoPage />} />

        {/* solo para no autenticados */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MenuInicio />}>

            {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
            {/* Rutas que no requieren permisos */}
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/recursos" element={<Recursos />} />
            {/* Rutas que requieren permisos */}
            <Route element={<PermissionRoute anyOf={["dashboard.read"]} />}>
              <Route path="/dashboard" element={<DashboardLayout />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["harvests.read", "harvests.create"]} />}>
              <Route path="/cosechas" element={<Cosechas />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["relaciones.read"]} />}>
              <Route path="/integraciones" element={<Integraciones />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["roles.read"]} />}>
              <Route path="/roles" element={<Roles />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["users.read"]} />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["especialistas.read"]} />}>
              <Route path="/especialistas" element={<Especialistas />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["harvest_tasks.read"]} />}>
              <Route path="/tareasprogramadas" element={<TareasProgramadasPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
