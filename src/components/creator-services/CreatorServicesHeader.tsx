
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatorServicesHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedServiceId: string;
  setSelectedServiceId: (value: string) => void;
  services: Array<{ id: string; name: string; }> | null;
}

export function CreatorServicesHeader({
  searchTerm,
  setSearchTerm,
  selectedServiceId,
  setSelectedServiceId,
  services,
}: CreatorServicesHeaderProps) {
  // Filtramos servicios para asegurar que solo usamos los que tienen id y name válidos
  const validServices = services?.filter(service => service.id && service.name) || [];
  
  console.log("Valid services for select:", validServices);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Creator Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage all creator services in the platform
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by creator name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select 
          value={selectedServiceId} 
          onValueChange={(value: string) => {
            console.log("Selected service:", value);
            setSelectedServiceId(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {validServices.map(service => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
