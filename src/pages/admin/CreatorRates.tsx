
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { CreatorRateDialog } from "@/components/creator-rates/CreatorRateDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreatorProfile {
  full_name: string | null;
  email?: string;
}

interface SocialPlatform {
  name: string;
}

interface PostType {
  name: string;
  social_platforms: SocialPlatform;
}

interface CreatorRate {
  id: string;
  profile_id: string;
  post_type_id: string;
  rate_usd: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_profile: CreatorProfile | null;
  post_types: PostType;
}

export default function CreatorRates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<CreatorRate | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: rates, isLoading, refetch } = useQuery({
    queryKey: ["creator-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_rates")
        .select(`
          *,
          creator_profile:profiles(
            full_name,
            email
          ),
          post_types(
            name,
            social_platforms(
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CreatorRate[];
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search-creators", searchEmail],
    enabled: searchEmail.length > 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email
        `)
        .ilike("email", `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      return data;
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRates = rates?.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil((rates?.length || 0) / itemsPerPage);

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
            </div>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Lista de Tarifas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarifa</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
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
                        {paginatedRates?.map((rate) => (
                          <TableRow key={rate.id}>
                            <TableCell>
                              {rate.creator_profile?.full_name}
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

                    <div className="flex justify-center mt-4 gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle>Agregar Nueva Tarifa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Buscar por correo
                        </label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="Ingresa el correo del creador"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                          />
                          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {searchResults && searchResults.length > 0 && (
                        <div className="border rounded-md p-2 space-y-2">
                          {searchResults.map((creator) => (
                            <div
                              key={creator.id}
                              className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                            >
                              <div>
                                <p className="font-medium">{creator.full_name}</p>
                                <p className="text-sm text-gray-600">
                                  {creator.email}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Seleccionar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
