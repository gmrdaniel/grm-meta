
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Rate {
  id: string;
  creator_profile: {
    full_name: string;
  };
  post_types: {
    name: string;
    social_platforms: {
      name: string;
      id: string;
    };
  };
  rate_usd: number;
  is_active: boolean;
}

interface RatesListProps {
  page: number;
  itemsPerPage: number;
}

export function RatesList({ page, itemsPerPage }: RatesListProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedPostType, setSelectedPostType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Consulta para obtener las plataformas sociales
  const { data: platforms } = useQuery({
    queryKey: ["social-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("id, name")
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });

  // Consulta para obtener los tipos de post
  const { data: postTypes } = useQuery({
    queryKey: ["post-types", selectedPlatform],
    queryFn: async () => {
      const query = supabase
        .from("post_types")
        .select("id, name")
        .eq("status", "active");

      if (selectedPlatform) {
        query.eq("platform_id", selectedPlatform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  // Consulta principal para las tarifas con filtros
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["creator-rates", page, selectedPlatform, selectedPostType, priceRange],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("creator_rates")
        .select(`
          id,
          creator_profile:profiles(
            full_name
          ),
          post_types(
            name,
            social_platforms(
              name,
              id
            )
          ),
          rate_usd,
          is_active
        `, { count: 'exact' })
        .gte("rate_usd", priceRange[0])
        .lte("rate_usd", priceRange[1])
        .order('created_at', { ascending: false });

      if (selectedPostType) {
        query = query.eq("post_type_id", selectedPostType);
      }

      if (selectedPlatform) {
        query = query.eq("post_types.platform_id", selectedPlatform);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return { data, count };
    },
  });

  const handleReset = () => {
    setSelectedPlatform("");
    setSelectedPostType("");
    setPriceRange([0, 1000]);
  };

  if (ratesLoading) return <div>Cargando tarifas...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarifas Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Filtros */}
          <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de Plataforma */}
              <div className="space-y-2">
                <Label>Red Social</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una red social" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {platforms?.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Tipo de Post */}
              <div className="space-y-2">
                <Label>Tipo de Publicación</Label>
                <Select value={selectedPostType} onValueChange={setSelectedPostType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {postTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de Precios */}
              <div className="space-y-2">
                <Label>Rango de Precios (USD)</Label>
                <div className="pt-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Reset */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Tabla de Resultados */}
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
        </div>
      </CardContent>
    </Card>
  );
}
