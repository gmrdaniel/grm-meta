
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationLogsList } from "@/components/admin/notification-logs/NotificationLogsList";
import { NewNotificationLog } from "@/components/admin/notification-logs/NewNotificationLog";

export default function NotificationLogsPage() {
  const [activeTab, setActiveTab] = useState("list");
  
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notification Logs</h1>
          <p className="text-muted-foreground">View and manage notification delivery logs</p>
        </div>
        
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Notification Logs</TabsTrigger>
            <TabsTrigger value="new">New Notification Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <NotificationLogsList />
          </TabsContent>
          
          <TabsContent value="new" className="space-y-4">
            <NewNotificationLog onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
