
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ServicePaymentsHeaderProps {
  showRecurringOnly: boolean;
  setShowRecurringOnly: (value: boolean) => void;
}

export function ServicePaymentsHeader({ showRecurringOnly, setShowRecurringOnly }: ServicePaymentsHeaderProps) {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pagos de Servicios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h1>
        <p className="text-muted-foreground">
          Gestiona los pagos de servicios de los creadores
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={showRecurringOnly}
          onCheckedChange={setShowRecurringOnly}
        />
        <Label htmlFor="recurring">Show recurring only</Label>
      </div>
    </>
  );
}
