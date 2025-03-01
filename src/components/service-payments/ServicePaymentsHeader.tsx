
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServicePaymentsHeaderProps {
  selectedBrandStatus: string;
  setSelectedBrandStatus: (value: string) => void;
  selectedCreatorStatus: string;
  setSelectedCreatorStatus: (value: string) => void;
}

export function ServicePaymentsHeader({
  selectedBrandStatus,
  setSelectedBrandStatus,
  selectedCreatorStatus,
  setSelectedCreatorStatus,
}: ServicePaymentsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h2>
          <p className="text-sm text-muted-foreground">
            Administra todos los pagos de servicios de la plataforma
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
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
