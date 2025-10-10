"use client";
import * as React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronUp, Home, Users, ShieldUser, Clock, PersonStanding, Blend, FileText, BarChart3, User2
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { abreviatura_institucio, nombre_sistema } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { makeCan, type CanOptions } from "@/lib/authz";

type NavItem = {
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  guard?: CanOptions;
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();

  // ⬇️ SIEMPRE arrays por defecto
  const { user, loading, logout, permissions = [], roles: rolesRaw = [] } = useAuth();
  // normaliza roles a lowercase string[]
  const roles = React.useMemo(
    () =>
      (Array.isArray(rolesRaw) ? rolesRaw : [])
        .map((r: any) => (typeof r === "string" ? r : r?.name))
        .filter(Boolean)
        .map((r: string) => r.toLowerCase()),
    [rolesRaw]
  );

  const [loadingLogout, setLoadingLogout] = React.useState(false);

  const { can } = React.useMemo(() => makeCan(permissions, roles), [permissions, roles]);
  const isAdmin = React.useMemo(() => roles.includes("admin"), [roles]);

  // LOGS de diagnóstico
  React.useEffect(() => {
    // Estos logs te dicen exactamente qué ve el Sidebar
    console.groupCollapsed("[Sidebar] auth snapshot");
    console.log("loading:", loading);
    console.log("user:", user);
    console.log("roles (raw):", rolesRaw);
    console.log("roles (norm):", roles);
    console.log("permissions:", permissions);
    console.log("isAdmin:", isAdmin);
    console.groupEnd();
  }, [loading, user, rolesRaw, roles, permissions, isAdmin]);

  // helper activo
  const isActivePath = React.useCallback(
    (to: string) => location.pathname === to || location.pathname.startsWith(to + "/"),
    [location.pathname]
  );

  // Menú principal
  const navMain: NavItem[] = React.useMemo(
    () => [
      { title: "Dashboard", to: "/dashboard", icon: Home, guard: { anyOf: ["dashboard.read"] } },
      { title: "Cosechas", to: "/cosechas", icon: BarChart3, guard: { anyOf: ["harvests.read", "harvests.create"] } },
      { title: "Recursos", to: "/recursos", icon: FileText, guard: { anyOf: [""] } },
      { title: "Integraciones", to: "/integraciones", icon: Blend, guard: { anyOf: ["relaciones.read"] } },
    ],
    []
  );

  // Menú administración
  const navSecondary: NavItem[] = React.useMemo(
    () => [
      { title: "Especialistas", to: "/especialistas", icon: PersonStanding, guard: { anyOf: ["especialistas.read"] } },
      { title: "Usuarios", to: "/usuarios", icon: Users, guard: { anyOf: ["users.read"] } },
      { title: "Tareas Programadas", to: "/tareasprogramadas", icon: Clock, guard: { anyOf: ["harvest_tasks.read"] } },
      { title: "Roles", to: "/roles", icon: ShieldUser, guard: { anyOf: ["roles.read"] } },
    ],
    []
  );

  // Durante carga, enseña un mensaje claro en vez de “nada”
  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild isActive={isActivePath("/dashboard")}>
                <NavLink to="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                    <img src="/images/Logo.png" alt="Logo Inaigem" className="object-contain w-full h-full" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{abreviatura_institucio}</span>
                    <span className="truncate text-xs">{nombre_sistema}</span>
                  </div>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-3 text-sm text-muted-foreground">Cargando permisos…</div>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
    );
  }

  // Filtrado: si es admin, bypass (muestra todo)
  const filteredMain = isAdmin ? navMain : navMain.filter((it) => !it.guard || can(it.guard));
  const filteredSecondary = isAdmin ? navSecondary : navSecondary.filter((it) => !it.guard || can(it.guard));

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoadingLogout(false);
    }
  };

  const displayName = user?.name ?? user?.email ?? "—";
  const email = user?.email ?? "";
  const initials = (displayName || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild isActive={isActivePath("/dashboard")}>
              <NavLink to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/images/Logo.png" alt="Logo Inaigem" className="object-contain w-full h-full" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{abreviatura_institucio}</span>
                  <span className="truncate text-xs">{nombre_sistema}</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Sistema */}
        {filteredMain.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMain.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActivePath(item.to)}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administración */}
        {filteredSecondary.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSecondary.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActivePath(item.to)}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* === DEBUG PANEL (solo en dev) === 
        {import.meta.env.DEV && (
          <div className="m-3 rounded-md border p-2 text-xs text-muted-foreground space-y-1">
            <div><b>DEBUG:</b></div>
            <div>roles: {JSON.stringify(roles)}</div>
            <div>permissions: {JSON.stringify(permissions?.slice(0, 5))}{permissions.length > 5 ? "…" : ""}</div>
            <div>isAdmin: {String(isAdmin)}</div>
            <div>main/items: {filteredMain.length} — admin/items: {filteredSecondary.length}</div>
          </div>
        )}*/}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder.svg" alt={displayName} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <NavLink to="/perfil" className="flex">
                    <User2 className="mr-2 h-4 w-4" />
                    Perfil
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={loadingLogout}>
                  {loadingLogout ? "Cerrando sesión..." : "Cerrar Sesión"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
