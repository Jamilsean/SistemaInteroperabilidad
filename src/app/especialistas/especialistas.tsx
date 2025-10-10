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
 import EspecialistasTable from "./especialistasTable";
export const Especialistas = () => {
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
              <BreadcrumbPage>Registro de especialistas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header con título y acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Especialistas</h1>
            <p className="text-muted-foreground">
              Gestión de especialistas
            </p>
          </div>
         
        </div>
      <div>
        <EspecialistasTable></EspecialistasTable>
      </div>
    </div>
    </div>
  );
};
