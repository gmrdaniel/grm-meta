
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  services: Service | null;
  profiles: Creator;
}

interface CreatorServiceWithEmail extends CreatorService {
  email?: string | null;
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
  const [servicesWithEmail, setServicesWithEmail] = useState<CreatorServiceWithEmail[]>([]);

  useEffect(() => {
    fetchCreatorsEmails();
  }, [creatorServices]);

  async function fetchCreatorsEmails() {
    const servicesWithEmailPromises = creatorServices.map(async (service) => {
      try {
        const { data: email } = await supabase
          .rpc('get_user_email', { user_id: service.profiles.id });
        
        return {
          ...service,
          email: email
        };
      } catch (error) {
        console.error("Error fetching email for creator:", error);
        return {
          ...service,
          email: null
        };
      }
    });

    const resolvedServices = await Promise.all(servicesWithEmailPromises);
    setServicesWithEmail(resolvedServices);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!servicesWithEmail || servicesWithEmail.length === 0) {
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
        {servicesWithEmail.map((creatorService) => {
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
                <span>{creatorService.email || "N/A"}</span>
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
