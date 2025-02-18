
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

export default function CreatorRates() {
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: rates, refetch: refetchRates } = useQuery({
    queryKey: ["creatorRates", page, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("creator_rates")
        .select(`
          *,
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

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        rates: data as CreatorRate[],
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tarifas de Creadores</h1>
        <Button onClick={() => setRateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarifa
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Buscar por nombre o usuario de Instagram..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
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
          refetchRates();
        }}
      />
    </div>
  );
}
