import {
  SidebarTrigger
} from "@/components/ui/sidebar"
 
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import TareasTable from "./taskTable";
 export const TareasProgramadasPage = () => {
   return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Sistema</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Registro de Tareas programadas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header con título y acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tareas programadas</h1>
            <p className="text-muted-foreground">
              Gestión de Tareas programadas
            </p>
          </div>
           
        </div>
      <div>
        <TareasTable></TareasTable>
      </div>
    </div>
    </div>
  );
};
