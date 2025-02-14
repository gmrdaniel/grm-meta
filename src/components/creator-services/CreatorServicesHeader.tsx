
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

interface CreatorServicesHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedServiceId: string;
  setSelectedServiceId: (value: string) => void;
  services: Array<{ id: string; name: string; }> | null;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  showRecurring: boolean;
  setShowRecurring: (value: boolean) => void;
}

export function CreatorServicesHeader({
  searchTerm,
  setSearchTerm,
  selectedServiceId,
  setSelectedServiceId,
  services,
  showAll,
  setShowAll,
  showRecurring,
  setShowRecurring,
}: CreatorServicesHeaderProps) {
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-all"
              checked={showAll}
              onCheckedChange={setShowAll}
            />
            <Label htmlFor="show-all">Show all statuses</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-recurring"
              checked={showRecurring}
              onCheckedChange={setShowRecurring}
            />
            <Label htmlFor="show-recurring">Show recurring only</Label>
          </div>
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
