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
import { NotificationSettingsListEvents } from "@/components/admin/notification-settings/NotificationSettingsListEvents";
import { Plus } from "lucide-react";
import { UnifiedNotificationSettings } from "@/components/admin/notification-settings/UnifiedNotificationSettings";
export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // Añadir estado para el evento seleccionado

  const handleCreateEventClick = () => {
    setActiveTab("createevent");
  };

  const handleEventCreated = () => {
    setActiveTab("events");
  };

  const handleCreateNotificationClick = (eventId: string | null) => {
    setSelectedEventId(eventId);
    setActiveTab("createnotification");
  };

  const handleManageNotificationsClick = (
    eventId: string | null,
    eventData?: any
  ) => {
    setSelectedEventId(eventId);
    if (eventData) {
      setSelectedEvent(eventData);
    }
    setActiveTab("managenotifications");
  };

  const handleNotificationCreated = () => {
    setActiveTab("managenotifications");
  };

  return (
    <Layout>
      <div className="container min-w-full py-6 px-2">
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
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            {/* <TabsTrigger value="send">Send Campaign</TabsTrigger> */}
            <TabsTrigger value="event">Send Event Invitation</TabsTrigger>
            {/* <TabsTrigger value="createevent">Create Event</TabsTrigger> */}
            <TabsTrigger value="events">Manage Events</TabsTrigger>
            <TabsTrigger value="managenotifications">
              Manage Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Statistics</CardTitle>{" "}
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
                <CardTitle>Send Event Invitation</CardTitle>{" "}
              </CardHeader>
              <CardContent>
                <EventInvitation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="createevent">
            <Card>
              <CardHeader></CardHeader>
              <CardContent>
                <CreateEvent onSuccess={handleEventCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
<CardTitle>Manage Events</CardTitle>              </CardHeader>
              <CardContent>
                <EventsList
                  onManageNotifications={handleManageNotificationsClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="createnotification">
            <Card>
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>{" "}
              </CardHeader>
              <CardContent>
                <UnifiedNotificationSettings
                  eventId={selectedEventId || ""}
                  eventName={selectedEvent?.event_name} // Usar el evento seleccionado
                  onSuccess={handleNotificationCreated}
                  onCancel={() => setActiveTab("managenotifications")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managenotifications">
            <Card className="min-w-fit max-w-full">
              <CardHeader>
<CardTitle>Manage Notifications</CardTitle>              </CardHeader>
              <CardContent>
                <NotificationSettingsListEvents
                  initialEventId={selectedEventId}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
