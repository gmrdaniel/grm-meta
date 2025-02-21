
import { useServices } from "@/hooks/useServices";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { data: services } = useServices();

  const paymentStatuses = ["all", "pendiente", "pagado", "atrasado"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label>Servicio</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Estado Pago Marca</Label>
          <Select value={selectedBrandStatus} onValueChange={setSelectedBrandStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Estado Pago Creador</Label>
          <Select value={selectedCreatorStatus} onValueChange={setSelectedCreatorStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="recurring"
            checked={showRecurringOnly}
            onCheckedChange={setShowRecurringOnly}
          />
          <Label htmlFor="recurring">Solo pagos recurrentes</Label>
        </div>
      </div>
    </div>
  );
}
