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
} from "@/components/ui/breadcrumb";
import { useRef } from "react"; 
 import type { TableIntegracionRef } from "./tableIntegracion";
import TableIntegracion from "./tableIntegracion";


 

export const Integraciones = () => {
 const tableRef = useRef<TableIntegracionRef>(null);
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
              <BreadcrumbPage>Integración de recursos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header con título y acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integración de recursos</h1>
            <p className="text-muted-foreground">
              Gestión te integración de recursos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button> */}
        
              {/* <IntegracionDialog onDone={() => tableRef.current?.reload()} /> */}
          </div>
        </div>

        <TableIntegracion ref={tableRef} />
      </div>
    </div>
  );
};
