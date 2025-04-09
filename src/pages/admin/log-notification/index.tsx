
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationLogsTab from "@/components/admin/notification-logs/NotificationLogsTab";

const NotificationLogsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Notification Logs</h1>
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="logs">Notification Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="mt-6">
          <NotificationLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationLogsPage;
