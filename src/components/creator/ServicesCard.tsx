
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Service {
  id: string;
  name: string;
  type: 'único' | 'recurrente' | 'contrato';
  description: string | null;
}

interface CreatorService {
  id: string;
  service: Service;
  status: string;
  start_date: string;
  end_date: string | null;
  monthly_fee: number | null;
  company_share: number | null;
  total_revenue: number | null;
  terms_accepted: boolean;
}

interface ServicesCardProps {
  creatorServices: CreatorService[];
  availableServices: Service[];
  selectedServiceId: string;
  onServiceSelect: (id: string) => void;
  onAddService: () => void;
  addingService: boolean;
}

export function ServicesCard({
  creatorServices,
  availableServices,
  selectedServiceId,
  onServiceSelect,
  onAddService,
  addingService,
}: ServicesCardProps) {
  const getStatusBadgeVariant = (status: string, terms_accepted: boolean) => {
    if (!terms_accepted) return "secondary";
    switch (status.toLowerCase()) {
      case 'activo':
        return 'default';
      case 'pendiente':
        return 'secondary';
      case 'terminado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {creatorServices.length > 0 && (
          <div className="space-y-4">
            {creatorServices.map((creatorService) => (
              <div key={creatorService.id} className="border p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <h3 className="font-medium text-lg">{creatorService.service.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusBadgeVariant(creatorService.status, creatorService.terms_accepted)}>
                      {creatorService.terms_accepted ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">
                      {creatorService.status}
                    </Badge>
                  </div>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="font-medium text-gray-500">Tipo</dt>
                    <dd className="capitalize">{creatorService.service.type}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Fecha de Firma</dt>
                    <dd>
                      {creatorService.terms_accepted 
                        ? format(new Date(creatorService.start_date), "dd/MM/yyyy")
                        : "No firmado"}
                    </dd>
                  </div>
                  {creatorService.monthly_fee !== null && (
                    <div>
                      <dt className="font-medium text-gray-500">Cuota Mensual</dt>
                      <dd>${creatorService.monthly_fee.toFixed(2)}</dd>
                    </div>
                  )}
                  {creatorService.company_share !== null && (
                    <div>
                      <dt className="font-medium text-gray-500">Comisión Empresa</dt>
                      <dd>{creatorService.company_share}%</dd>
                    </div>
                  )}
                  {creatorService.total_revenue !== null && (
                    <div>
                      <dt className="font-medium text-gray-500">Ingresos Totales</dt>
                      <dd>${creatorService.total_revenue.toFixed(2)}</dd>
                    </div>
                  )}
                  {creatorService.end_date && (
                    <div>
                      <dt className="font-medium text-gray-500">Fecha de Finalización</dt>
                      <dd>{format(new Date(creatorService.end_date), "dd/MM/yyyy")}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Agregar Nuevo Servicio</h3>
          <div className="flex gap-4">
            <Select value={selectedServiceId} onValueChange={onServiceSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {availableServices
                  .filter(service => !creatorServices.some(cs => cs.service.id === service.id))
                  .map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={onAddService} 
              disabled={addingService || !selectedServiceId}
            >
              {addingService ? "Agregando..." : "Agregar Servicio"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
