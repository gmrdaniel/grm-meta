
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { ServicePaymentForm } from "./ServicePaymentForm";

interface Creator {
  id: string;
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
  updated_at: string;
  services: Service;
  profiles: Creator;
}

interface CreatorServicesTableContentProps {
  isLoading: boolean;
  creatorServices?: CreatorService[];
}

export function CreatorServicesTableContent({
  isLoading,
  creatorServices,
}: CreatorServicesTableContentProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creatorServices?.map((creatorService) => (
          <TableRow key={creatorService.id}>
            <TableCell>
              {creatorService.profiles.personal_data
                ? `${creatorService.profiles.personal_data.first_name} ${creatorService.profiles.personal_data.last_name}`
                : "N/A"}
            </TableCell>
            <TableCell>{creatorService.services.name}</TableCell>
            <TableCell>{creatorService.services.type}</TableCell>
            <TableCell>{creatorService.status}</TableCell>
            <TableCell>
              {format(new Date(creatorService.created_at), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>
              {format(new Date(creatorService.updated_at), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSelectedServiceId(creatorService.id)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Registrar Pago</SheetTitle>
                  </SheetHeader>
                  {selectedServiceId && (
                    <ServicePaymentForm
                      creatorServiceId={selectedServiceId}
                      onClose={() => setSelectedServiceId(null)}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
