
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { CreatorRateDialog } from "@/components/creator-rates/CreatorRateDialog";

interface CreatorRate {
  id: string;
  profile_id: string;
  post_type_id: string;
  rate_usd: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  registered_at?: string;
  personal_data: {
    first_name: string;
    last_name: string;
  };
  post_types: {
    name: string;
    social_platforms: {
      name: string;
    };
  };
}

export default function CreatorRates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<CreatorRate | null>(null);
  const { toast } = useToast();

  const { data: rates, isLoading, refetch } = useQuery({
    queryKey: ["creator-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_rates")
        .select(`
          *,
          personal_data!creator_rates_profile_id_fkey (
            first_name,
            last_name
          ),
          post_types (
            name,
            social_platforms (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CreatorRate[];
    },
  });

  const handleStatusChange = async (rate: CreatorRate) => {
    try {
      const { error } = await supabase
        .from("creator_rates")
        .update({ is_active: !rate.is_active })
        .eq("id", rate.id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "La tarifa ha sido actualizada correctamente.",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la tarifa.",
      });
    }
  };

  const handleEditRate = (rate: CreatorRate) => {
    setSelectedRate(rate);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <Skeleton className="h-8 w-1/4 mb-6" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tarifas de Creadores</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarifa
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Tarifas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creador</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tarifa (USD)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates?.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>
                          {rate.personal_data?.first_name}{" "}
                          {rate.personal_data?.last_name}
                        </TableCell>
                        <TableCell>
                          {rate.post_types?.social_platforms?.name}
                        </TableCell>
                        <TableCell>{rate.post_types?.name}</TableCell>
                        <TableCell>${rate.rate_usd.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={rate.is_active ? "default" : "secondary"}
                          >
                            {rate.is_active ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRate(rate)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(rate)}
                            >
                              {rate.is_active ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <CreatorRateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rate={selectedRate}
        onSuccess={() => {
          refetch();
          setIsDialogOpen(false);
          setSelectedRate(null);
        }}
      />
    </div>
  );
}
