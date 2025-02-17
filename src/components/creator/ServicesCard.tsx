
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
  terms_accepted: boolean;
  start_date: string;
  end_date: string | null;
  monthly_fee: number | null;
  company_share: number | null;
  total_revenue: number | null;
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
  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return "bg-gray-500";
    switch (status.toLowerCase()) {
      case 'activo':
        return 'bg-green-500';
      case 'pendiente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
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
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-lg">{creatorService.service.name}</h3>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(creatorService.status, creatorService.terms_accepted)}>
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
                      {creatorService.start_date
                        ? format(new Date(creatorService.start_date), "dd/MM/yyyy")
                        : "No firmado"}
                    </dd>
                  </div>
                  {creatorService.monthly_fee && (
                    <div>
                      <dt className="font-medium text-gray-500">Cuota Mensual</dt>
                      <dd>${creatorService.monthly_fee}</dd>
                    </div>
                  )}
                  {creatorService.company_share && (
                    <div>
                      <dt className="font-medium text-gray-500">Comisión Empresa</dt>
                      <dd>{creatorService.company_share}%</dd>
                    </div>
                  )}
                  {creatorService.total_revenue && (
                    <div>
                      <dt className="font-medium text-gray-500">Ingresos Totales</dt>
                      <dd>${creatorService.total_revenue}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Service</h3>
          <div className="flex gap-4">
            <Select value={selectedServiceId} onValueChange={onServiceSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a service" />
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
              {addingService ? "Adding..." : "Add Service"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
