
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface RatesListProps {
  page: number;
  itemsPerPage: number;
}

export function RatesList({ page, itemsPerPage }: RatesListProps) {
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

  if (ratesLoading) return <div>Cargando tarifas...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarifas Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
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
