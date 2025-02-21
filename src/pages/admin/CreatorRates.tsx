
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreatorRateDialog } from "@/components/post-types/CreatorRateDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type CreatorRate = {
  id: string;
  creator_id: string;
  platform_id: string;
  post_type_id: string;
  rate_usd: number;
  created_at: string;
  profiles: {
    id: string;
    personal_data: {
      first_name: string | null;
      last_name: string | null;
      instagram_username: string | null;
    } | null;
  };
  social_platforms: {
    name: string;
  };
  post_types: {
    name: string;
  };
};

type FilterState = {
  platform_id: string;
  post_type_id: string;
  min_rate: string;
  max_rate: string;
};

export default function CreatorRates() {
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    platform_id: "all",
    post_type_id: "all",
    min_rate: "",
    max_rate: "",
  });
  const itemsPerPage = 10;

  const { data: platforms = [], isLoading: isLoadingPlatforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data?.filter(platform => platform.id && platform.name) || [];
    },
  });

  const { data: postTypes = [], isLoading: isLoadingPostTypes } = useQuery({
    queryKey: ["postTypes", filters.platform_id],
    queryFn: async () => {
      let query = supabase
        .from("post_types")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (filters.platform_id && filters.platform_id !== "all") {
        query = query.eq("platform_id", filters.platform_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data?.filter(type => type.id && type.name) || [];
    },
    enabled: true,
  });

  const { data: rates, isLoading: isLoadingRates } = useQuery({
    queryKey: ["creatorRates", page, searchTerm, filters],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("creator_rates")
        .select(`
          id,
          rate_usd,
          created_at,
          profiles!creator_rates_creator_id_fkey (
            id,
            personal_data (
              first_name,
              last_name,
              instagram_username
            )
          ),
          social_platforms!creator_rates_platform_id_fkey (
            name
          ),
          post_types!creator_rates_post_type_id_fkey (
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.textSearch('profiles.personal_data->first_name', `${searchTerm}:*`);
      }

      if (filters.platform_id && filters.platform_id !== "all") {
        query = query.eq('platform_id', filters.platform_id);
      }

      if (filters.post_type_id && filters.post_type_id !== "all") {
        query = query.eq('post_type_id', filters.post_type_id);
      }

      if (filters.min_rate) {
        query = query.gte('rate_usd', parseFloat(filters.min_rate));
      }

      if (filters.max_rate) {
        query = query.lte('rate_usd', parseFloat(filters.max_rate));
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        rates: data as CreatorRate[],
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
    },
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      if (key === 'platform_id' && value !== prev.platform_id) {
        return { ...prev, [key]: value, post_type_id: "all" };
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  };

  if (isLoadingPlatforms || isLoadingPostTypes || isLoadingRates) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
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
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Tarifas de Creadores</h1>
              <Button onClick={() => setRateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarifa
              </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="max-w-[200px]"
                  />
                </div>

                <div className="flex gap-4 flex-1 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Select
                      value={filters.platform_id}
                      onValueChange={(value) => handleFilterChange('platform_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Red Social" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las redes</SelectItem>
                        {platforms.map((platform) => (
                          platform.id && platform.name ? (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Select
                      value={filters.post_type_id}
                      onValueChange={(value) => handleFilterChange('post_type_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Publicación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {postTypes.map((type) => (
                          type.id && type.name ? (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 flex-1 min-w-[200px]">
                    <Input
                      type="number"
                      placeholder="Tarifa mínima"
                      value={filters.min_rate}
                      onChange={(e) => handleFilterChange('min_rate', e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Tarifa máxima"
                      value={filters.max_rate}
                      onChange={(e) => handleFilterChange('max_rate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creador</TableHead>
                  <TableHead>Red Social</TableHead>
                  <TableHead>Tipo de Publicación</TableHead>
                  <TableHead>Tarifa (USD)</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates?.rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      {rate.profiles.personal_data?.first_name} {rate.profiles.personal_data?.last_name}
                      {rate.profiles.personal_data?.instagram_username && (
                        <span className="text-sm text-gray-500 block">
                          @{rate.profiles.personal_data.instagram_username}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{rate.social_platforms.name}</TableCell>
                    <TableCell>{rate.post_types.name}</TableCell>
                    <TableCell>${rate.rate_usd}</TableCell>
                    <TableCell>
                      {new Date(rate.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {rates?.totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3">
                  Página {page} de {rates.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(rates.totalPages, prev + 1))}
                  disabled={page === rates.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}

            <CreatorRateDialog
              open={rateDialogOpen}
              onOpenChange={setRateDialogOpen}
              onSuccess={() => {
                setRateDialogOpen(false);
                refetchRates();
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
