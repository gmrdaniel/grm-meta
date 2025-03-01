
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useServices } from "@/hooks/useServices";

interface ServicePaymentsHeaderProps {
  showRecurringOnly: boolean;
  setShowRecurringOnly: (value: boolean) => void;
  selectedService: string;
  setSelectedService: (value: string) => void;
  selectedBrandStatus: string;
  setSelectedBrandStatus: (value: string) => void;
  selectedCreatorStatus: string;
  setSelectedCreatorStatus: (value: string) => void;
}

export function ServicePaymentsHeader({
  showRecurringOnly,
  setShowRecurringOnly,
  selectedService,
  setSelectedService,
  selectedBrandStatus,
  setSelectedBrandStatus,
  selectedCreatorStatus,
  setSelectedCreatorStatus,
}: ServicePaymentsHeaderProps) {
  const { data: services, isLoading } = useServices();

  // Parsear y filtrar los servicios para asegurarnos de que son válidos
  const validServices = services?.filter(service => 
    service && typeof service.id === 'string' && typeof service.name === 'string'
  ) || [];

  console.log("Servicios disponibles para el filtro:", validServices);
  console.log("Servicio actualmente seleccionado:", selectedService);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h2>
          <p className="text-sm text-muted-foreground">
            Administra todos los pagos de servicios de la plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring-filter"
            checked={showRecurringOnly}
            onCheckedChange={(value) => {
              console.log("Cambiando filtro de recurrentes a:", value);
              setShowRecurringOnly(value);
            }}
          />
          <Label htmlFor="recurring-filter">Solo pagos recurrentes</Label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-auto md:flex-1">
          <Select 
            value={selectedService} 
            disabled={isLoading}
            onValueChange={(value) => {
              console.log("Seleccionando servicio:", value);
              setSelectedService(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {validServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto md:flex-1">
          <Select 
            value={selectedBrandStatus} 
            onValueChange={setSelectedBrandStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado pago marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto md:flex-1">
          <Select 
            value={selectedCreatorStatus} 
            onValueChange={setSelectedCreatorStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado pago creador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
