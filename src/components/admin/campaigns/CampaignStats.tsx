import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { Mail, Users, BarChart, AlertTriangle } from "lucide-react";

interface Campaign {
  CampaignID: number;
  DeliveredCount: number;  // Cambiar SendCount por DeliveredCount
  OpenedCount: number;     // Cambiar OpenCount por OpenedCount
  ClickedCount: number;    // Cambiar ClickCount por ClickedCount
  BouncedCount: number;    // Cambiar BounceCount por BouncedCount
  LastActivityAt: string;  // Agregar este campo
  CampaignSubject: string; // Agregar este campo
}

interface CampaignResponse {
  Count: number;
  Data: Campaign[];
  Total: number;
}

export function CampaignStats() {
  const { data, isLoading, error } = useQuery<CampaignResponse>({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mailjet-stats", {
        body: {}
      });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar las estadísticas: {error.message}
      </div>
    );
  }

  // Actualizar el cálculo de totales
  const totals = data?.Data.reduce(
    (acc, campaign) => ({
      sent: acc.sent + campaign.DeliveredCount,
      opened: acc.opened + campaign.OpenedCount,
      clicked: acc.clicked + campaign.ClickedCount,
      bounced: acc.bounced + campaign.BouncedCount,
    }),
    { sent: 0, opened: 0, clicked: 0, bounced: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Mensajes Enviados"
          value={totals?.sent.toString() || "0"}
          description="Total de mensajes enviados"
          icon={<Mail size={20} />}
          trend="up"
        />
        <StatsCard
          title="Tasa de Apertura"
          value={`${((totals?.opened || 0) / (totals?.sent || 1) * 100).toFixed(1)}%`}
          description="Mensajes abiertos"
          icon={<Users size={20} />}
          trend="up"
        />
        <StatsCard
          title="Tasa de Clics"
          value={`${((totals?.clicked || 0) / (totals?.sent || 1) * 100).toFixed(1)}%`}
          description="Enlaces clickeados"
          icon={<BarChart size={20} />}
          trend="up"
        />
        <StatsCard
          title="Tasa de Rebote"
          value={`${((totals?.bounced || 0) / (totals?.sent || 1) * 100).toFixed(1)}%`}
          description="Mensajes rebotados"
          icon={<AlertTriangle size={20} />}
          trend="down"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Campañas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abiertos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rebotados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.Data.map((campaign) => (
                  <tr key={campaign.CampaignID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.CampaignID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.DeliveredCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.OpenedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.ClickedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.BouncedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.LastActivityAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}