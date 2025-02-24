
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail } from "lucide-react";

interface Creator {
  id: string;
  email?: string; // Hacemos email opcional
  personal_data: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Service {
  id: string;
  name: string;
  type: string;
}

interface CreatorService {
  id: string;
  status: string;
  created_at: string;
  services: Service | null;
  profiles: Creator;
}

interface CreatorServicesTableContentProps {
  isLoading: boolean;
  creatorServices?: CreatorService[];
  onServiceSelect: (serviceId: string) => void;
}

export function CreatorServicesTableContent({
  isLoading,
  creatorServices = [],
  onServiceSelect,
}: CreatorServicesTableContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!creatorServices || creatorServices.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay servicios disponibles
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creatorServices.map((creatorService) => {
          if (!creatorService) return null;

          return (
            <TableRow key={creatorService.id}>
              <TableCell>
                {creatorService.profiles?.personal_data
                  ? `${creatorService.profiles.personal_data.first_name} ${creatorService.profiles.personal_data.last_name}`
                  : "N/A"}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{creatorService.profiles?.email || "N/A"}</span>
              </TableCell>
              <TableCell>{creatorService.services?.name ?? "N/A"}</TableCell>
              <TableCell>{creatorService.services?.type ?? "N/A"}</TableCell>
              <TableCell>{creatorService.status ?? "N/A"}</TableCell>
              <TableCell>
                {creatorService.created_at
                  ? format(new Date(creatorService.created_at), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onServiceSelect(creatorService.id)}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

