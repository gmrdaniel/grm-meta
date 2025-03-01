
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail } from "lucide-react";

interface CreatorService {
  id: string;
  profile_full_name: string;
  personal_email: string;
  instagram_username: string | null;
  service_name: string;
  service_type: string;
  status: string;
  created_at: string;
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
          <TableHead>Instagram</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creatorServices.map((creatorService) => {
          if (!creatorService) return null;

          return (
            <TableRow key={creatorService.id}>
              <TableCell>
                {creatorService.profile_full_name || "N/A"}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{creatorService.personal_email || "N/A"}</span>
              </TableCell>
              <TableCell>{creatorService.instagram_username || "N/A"}</TableCell>
              <TableCell>{creatorService.service_name || "N/A"}</TableCell>
              <TableCell>{creatorService.service_type || "N/A"}</TableCell>
              <TableCell>{creatorService.status || "N/A"}</TableCell>
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
