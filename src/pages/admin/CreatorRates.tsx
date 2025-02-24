
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, DollarSign, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Creator {
  id: string;
  email: string;
  full_name: string | null;
}

interface Rate {
  id: string;
  creator_profile: {
    full_name: string;
  };
  post_types: {
    name: string;
    social_platforms: {
      name: string;
    };
  };
  rate_usd: number;
  is_active: boolean;
}

export default function CreatorRates() {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Query para obtener las tarifas paginadas
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["creator-rates", page],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from("creator_rates")
        .select(`
          id,
          creator_profile:profiles(
            full_name
          ),
          post_types(
            name,
            social_platforms(
              name
            )
          ),
          rate_usd,
          is_active
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count };
    },
  });

  // Query para buscar creators por email
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["search-creators", searchEmail],
    queryFn: async () => {
      if (!searchEmail) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: searchEmail.length > 0,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Tarifas de Creadores</h1>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Lista de Tarifas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarifa</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarifas Existentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {ratesLoading ? (
                        <div>Cargando tarifas...</div>
                      ) : (
                        <div className="rounded-md border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="p-4 text-left">Creador</th>
                                <th className="p-4 text-left">Plataforma</th>
                                <th className="p-4 text-left">Tipo</th>
                                <th className="p-4 text-left">Tarifa (USD)</th>
                                <th className="p-4 text-left">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rates?.data.map((rate) => (
                                <tr key={rate.id} className="border-b">
                                  <td className="p-4">
                                    {rate.creator_profile?.full_name}
                                  </td>
                                  <td className="p-4">
                                    {rate.post_types?.social_platforms?.name}
                                  </td>
                                  <td className="p-4">{rate.post_types?.name}</td>
                                  <td className="p-4">${rate.rate_usd}</td>
                                  <td className="p-4">
                                    <Badge
                                      variant={rate.is_active ? "default" : "secondary"}
                                    >
                                      {rate.is_active ? "Activa" : "Inactiva"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {/* TODO: Agregar paginación */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle>Buscar Creador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label>Correo del Creador</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar por correo electrónico"
                              value={searchEmail}
                              onChange={(e) => setSearchEmail(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </div>

                      {searchLoading && <div>Buscando...</div>}

                      {searchResults && searchResults.length > 0 && (
                        <div className="border rounded-md">
                          {searchResults.map((creator) => (
                            <div
                              key={creator.id}
                              className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                              onClick={() => setSelectedCreator(creator)}
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{creator.email}</span>
                              </div>
                              {creator.full_name && (
                                <span className="text-sm text-muted-foreground">
                                  {creator.full_name}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedCreator && (
                        <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">Creador seleccionado:</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCreator.email}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCreator(null)}>
                            Cambiar
                          </Button>
                        </div>
                      )}

                      {selectedCreator && (
                        <Button className="w-full">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Nueva Tarifa de Creador
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
