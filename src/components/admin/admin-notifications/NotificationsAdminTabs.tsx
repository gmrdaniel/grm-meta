
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettingsList } from "./settings/NotificationSettingsList";
import { NotificationSettingsForm } from "./settings/NotificationSettingsForm";
import { NotificationLogsTab } from "./logs/NotificationLogsTab";
import { useState } from "react";

export function NotificationsAdminTabs() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="list">Notification List</TabsTrigger>
        <TabsTrigger value="new">New Notification</TabsTrigger>
        <TabsTrigger value="logs">Notification Logs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="space-y-4">
        <NotificationSettingsList onCreateNew={() => setActiveTab("new")} />
      </TabsContent>
      
      <TabsContent value="new" className="space-y-4">
        <NotificationSettingsForm onSuccess={() => setActiveTab("list")} />
      </TabsContent>
      
      <TabsContent value="logs" className="space-y-4">
        <NotificationLogsTab />
      </TabsContent>
    </Tabs>
  );
}
