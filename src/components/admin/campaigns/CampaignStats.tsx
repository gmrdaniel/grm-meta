import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { Mail, Users, BarChart, AlertTriangle, PieChart, ExternalLink, ChartNoAxesColumnDecreasing } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Campaign {
  CampaignID: number;
  CampaignName: string;
  EventClickDelay: string;
  EventClickCount: string;
  EventOpenDelay: string;
  EventOpenedCount: string;
  MessageBlockedCount: string;
  MessageClickedCount: string;
  MessageDeferredCount: string;
  MessageHardBouncedCount: string;
  MessageOpenedCount: string;
  MessageQueuedCount: string;
  MessageSentCount: string;
  MessageSoftBouncedCount: string;
  MessageSpamCount: string;
  MessageUnsubscribedCount: string;
  MessageWorkflowExitedCount: string;
  Timeslice: string;
}

interface CampaignResponse {
  Count: number;
  Data: Campaign[];
  Total: number;
}

interface CampaignDetailResponse {
  campaign: {
    id: number;
    stats: any;
    messagesByStatus: Record<string, number>;
    messagesCount: number;
    messages: any[];
  }
}

// Nuevas interfaces para los contadores de usuarios
interface UserCounts {
  converted: number;
  interested: number;
}

export function CampaignStats() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  // Nuevo estado para almacenar los contadores de usuarios
  const [userCounts, setUserCounts] = useState<UserCounts>({ converted: 0, interested: 0 });

  const { data, isLoading, error } = useQuery<CampaignResponse>({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mailjet-stats", {
        body: { endpoint: "/statcounters" }
      });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: campaignDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuery<CampaignDetailResponse>({
    queryKey: ["campaign-detail", selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) throw new Error("No campaign selected");
      
      const { data, error } = await supabase.functions.invoke("mailjet-single-campaign-stats", {
        body: { campaignId: selectedCampaignId }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCampaignId && isDetailModalOpen,
  });


  const { data: userCountsData, isLoading: isLoadingUserCounts } = useQuery({
    queryKey: ["user-counts", selectedCampaigns],
    queryFn: async () => {
      if (selectedCampaigns.length === 0) {
        return { converted: 0, interested: 0 };
      }
      
      // Paso 1: Obtener los invitation_event_id
      const { data: notificationSettings, error: notificationError } = await supabase
        .from('notification_settings')
        .select('id')
        .in('campaign_id', selectedCampaigns.map(String));
        
      if (notificationError) throw notificationError;
      
      // Si no hay resultados, retornamos ceros
      if (!notificationSettings || notificationSettings.length === 0) {
        return { converted: 0, interested: 0 };
      }
      
      // Extraemos los IDs de eventos
      const eventIds = notificationSettings
        .filter(setting => setting.id) // Filtramos valores nulos
        .map(setting => setting.id);
      console.log(eventIds)
      // Si no hay IDs de eventos, retornamos ceros
      if (eventIds.length === 0) {
        return { converted: 0, interested: 0 };
      }
      

      
      // Obtenemos usuarios convertidos (status = 'completed')
      const { data: convertedData, error: convertedError } = await supabase
        .from('creator_invitations')
        .select('id')
        .eq('status', 'completed')
        .in('registration_notification_id', eventIds);
  
      if (convertedError) throw convertedError;
  
      // Obtenemos usuarios interesados (status = 'in process')
      const { data: interestedData, error: interestedError } = await supabase
        .from('creator_invitations')
        .select('id')
        .eq('status', 'in process')
        .in('registration_notification_id', eventIds);
  
      if (interestedError) throw interestedError;
  
      const counts = {
        converted: convertedData?.length || 0,
        interested: interestedData?.length || 0
      };
      
      setUserCounts(counts);
      
      return counts;
    },
    enabled: selectedCampaigns.length > 0,
  });

  const handleCampaignToggle = (campaignId: number) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const openDetailModal = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setIsDetailModalOpen(true);
  };

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

  // Filtrar campañas seleccionadas
  const campaignsToUse = selectedCampaigns.length > 0
    ? data?.Data.filter(campaign => selectedCampaigns.includes(campaign.CampaignID))
    : [];

  // Calcular totales con los datos filtrados
  const totals = campaignsToUse?.reduce(
    (acc, campaign) => ({
      sent: acc.sent + parseInt(campaign.MessageSentCount || "0"),
      opened: acc.opened + parseInt(campaign.MessageOpenedCount || "0"),
      clicked: acc.clicked + parseInt(campaign.MessageClickedCount || "0"),
      bounced: acc.bounced + parseInt(campaign.MessageHardBouncedCount || "0") + parseInt(campaign.MessageSoftBouncedCount || "0"),
    }),
    { sent: 0, opened: 0, clicked: 0, bounced: 0 }
  ) || { sent: 0, opened: 0, clicked: 0, bounced: 0 };

  // Encontrar la campaña seleccionada para el modal
  const selectedCampaign = data?.Data.find(campaign => campaign.CampaignID === selectedCampaignId);
 
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">Seleccionar Campañas</h3>
              <p className="text-sm text-gray-500 mb-4">
                Seleccione una o más campañas para ver sus estadísticas
              </p>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {data?.Data.map((campaign) => (
                    <div key={campaign.CampaignID} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`campaign-${campaign.CampaignID}`} 
                        checked={selectedCampaigns.includes(campaign.CampaignID)}
                        onCheckedChange={() => handleCampaignToggle(campaign.CampaignID)}
                      />
                      <Label 
                        htmlFor={`campaign-${campaign.CampaignID}`}
                        className="text-sm cursor-pointer"
                      >
                        {campaign.CampaignName}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Mensajes Enviados"
              value={selectedCampaigns.length > 0 ? totals?.sent.toString() : "-"}
              description="Total de mensajes enviados"
              icon={<Mail size={20} />}
              trend="up"
            />
            <StatsCard
              title="Tasa de Apertura"
              value={selectedCampaigns.length > 0 ? `${((totals?.opened || 0) / (totals?.sent || 1) * 100).toFixed(1)}%` : "-"}
              description="Mensajes abiertos"
              icon={<Users size={20} />}
              trend="up"
            />
            <StatsCard
              title="Tasa de Clics"
              value={selectedCampaigns.length > 0 ? `${((totals?.clicked || 0) / (totals?.sent || 1) * 100).toFixed(1)}%` : "-"}
              description="Enlaces clickeados"
              icon={<BarChart size={20} />}
              trend="up"
            />
            <StatsCard
              title="Tasa de Rebote"
              value={selectedCampaigns.length > 0 ? `${((totals?.bounced || 0) / (totals?.sent || 1) * 100).toFixed(1)}%` : "-"}
              description="Mensajes rebotados"
              icon={<AlertTriangle size={20} />}
              trend="down"
            />
            
            {/* Nuevas stats cards */}
            <StatsCard
              title="Usuarios Convertidos"
              value={selectedCampaigns.length > 0 ? userCounts.converted.toString() : "-"}
              description="Usuarios con registro completado"
              icon={<PieChart size={20} />}
              trend="up"
            />
            <StatsCard
              title="Usuarios Interesados"
              value={selectedCampaigns.length > 0 ? userCounts.interested.toString() : "-"}
              description="Usuarios en proceso de registro"
              icon={<ExternalLink size={20} />}
              trend="up"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCampaigns.length > 0 
              ? `Campañas seleccionadas (${selectedCampaigns.length})` 
              : "Seleccione campañas para ver estadísticas"}
          </h2>
          {selectedCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>*/}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abiertos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rebotados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloqueados</th>
                    
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaignsToUse?.map((campaign) => (
                    <tr key={campaign.CampaignID}>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => openDetailModal(campaign.CampaignID)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <PieChart size={16} className="mr-1" />
                          <span>Ver detalles</span>
                        </button>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.CampaignID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.CampaignName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.MessageSentCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.MessageOpenedCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.MessageClickedCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseInt(campaign.MessageHardBouncedCount) + parseInt(campaign.MessageSoftBouncedCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.MessageSpamCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.MessageBlockedCount}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay campañas seleccionadas. Por favor, seleccione al menos una campaña para ver sus estadísticas.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles de Campaña */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de Campaña: {selectedCampaign?.CampaignName}</DialogTitle>
            <DialogDescription>
              ID de Campaña: {selectedCampaignId}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            {isLoadingDetail ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando estadísticas detalladas...</p>
              </div>
            ) : campaignDetail ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-4">Últimos 10 Mensajes</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Click</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apertura</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UnSub</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>

                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {campaignDetail.campaign.messages.slice(0, 20).map((message) => (
                            <tr key={message.ID}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{message.ContactAlt || message.ContactID}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{message.Status}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{message.IsClickTracked ? "Sí" : "No"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{message.IsOpenTracked ? "Sí" : "No"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{message.IsUnsubTracked ? "Sí" : "No"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {new Date(message.ArrivedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-8 text-center text-red-500">
                Error al cargar los detalles de la campaña.
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  
}