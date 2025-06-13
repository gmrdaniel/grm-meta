import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import ImportCampaign from "@/components/admin/campaigns/SendCampaign";
import { CampaignStats } from "@/components/admin/campaigns/CampaignStats";
import EventInvitation from "@/components/admin/campaigns/EventInvitation";
import CreateEvent from "@/components/admin/campaigns/CreateEvent";
import EventsList from "@/components/admin/events/EventsList";
import { Plus } from "lucide-react";

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState("statistics");

  const handleCreateEventClick = () => {
    setActiveTab("createevent");
  };

  const handleEventCreated = () => {
    setActiveTab("events");
  };

  return (
    <Layout>
      <div className="container max-w-full py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Campañas</h1>
          {activeTab === "events" && (
            <Button onClick={handleCreateEventClick}>
              <Plus size={18} className="mr-2" />
              Crear evento
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
            {/* <TabsTrigger value="send">Enviar Campaña</TabsTrigger> */}
            <TabsTrigger value="event">Enviar Invitación a Evento</TabsTrigger>
            {/* <TabsTrigger value="createevent">Crear Evento</TabsTrigger> */}
            <TabsTrigger value="events">Gestionar Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Campañas</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignStats />
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Campaña</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportCampaign />
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="event">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Invitación a Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <EventInvitation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="createevent">
            <Card>
              <CardHeader>
                <CardTitle>Crear Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateEvent onSuccess={handleEventCreated} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <EventsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}