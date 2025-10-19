import {  Routes, Route, Navigate, } from "react-router-dom";
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
import PerfilPage from "@/app/perfil/PerfilPage";
import { PermissionRoute } from "./PermissionRoute";
import RecursoDetailPage from "@/app/landigPage/RecursoDetailPage";
import { Header } from "@/components/landing/header";
import BuscarPage from "@/app/landigPage/landingv2/buscarPage";
import LandingPageV3 from "@/app/landigPage/landingv3/landingv3";
import LandingPageV3Meili from "@/app/landigPage/landingv3/landingv3Meili";
export default function AppRoutes() {
  return (
    
    <Routes>
      <Route path="/landingPage" element={<LandingPageV3 />} />
      <Route path="/landingPageMeili" element={<LandingPageV3Meili />} />


      <Route path="/" element={<SSOEntry />} />
      <Route element={<Header />}>
        {/* <Route path="/landingPage" element={<LandingPageV2 />} /> */}
        <Route path="/recursos/:id" element={<RecursoDetailPage />} />
      </Route>
      <Route path="/buscar" element={<BuscarPage />} />
      <Route path="/documentos" element={<Navigate to="/buscar?repositorio_id=2&sort_by=views&sort_dir=desc" replace />} />
      <Route path="/mapas" element={<Navigate to="/buscar?repositorio_id=3&sort_by=views&sort_dir=desc" replace />} />
      <Route path="/datasets" element={<Navigate to="/buscar?repositorio_id=1&sort_by=views&sort_dir=desc" replace />} />


            {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
            {/* Rutas que no requieren permisos */}
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/recursos" element={<Recursos />} />
            {/* <Route path="/recursos/:id" element={<RecursoDetailPage />} /> */}
            <Route path="/voto/:token" element={<VotoPage />} />
            {/* Rutas que requieren permisos */}
            <Route element={<PermissionRoute anyOf={["dashboard.read"]} />}>
              <Route path="/dashboard" element={<DashboardLayout />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["harvests.read", "harvests.create"]} />}>
              <Route path="/cosechas" element={<Cosechas />} />
            </Route>
            <Route element={<PermissionRoute anyOf={["harvests.read"]} />}>
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
          {/* <Route path="/recursos/:id" element={<RecursoDetailPage />} /> */}
          <Route path="/voto/:token" element={<VotoPage />} />
          {/* Rutas que requieren permisos */}
          <Route element={<PermissionRoute anyOf={["dashboard.read"]} />}>
            <Route path="/dashboard" element={<DashboardLayout />} />
          </Route>
          <Route element={<PermissionRoute anyOf={["harvests.read", "harvests.create"]} />}>
            <Route path="/cosechas" element={<Cosechas />} />
          </Route>
          <Route element={<PermissionRoute anyOf={["harvests.read"]} />}>
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
  );
}
