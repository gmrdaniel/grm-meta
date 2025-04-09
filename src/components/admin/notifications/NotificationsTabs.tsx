
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettingsTab } from "./settings/NotificationSettingsTab";
import { NotificationLogsTab } from "./logs/NotificationLogsTab";

export const NotificationsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        <TabsTrigger value="logs">Notification Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <NotificationSettingsTab />
      </TabsContent>
      <TabsContent value="logs">
        <NotificationLogsTab />
      </TabsContent>
    </Tabs>
  );
};
