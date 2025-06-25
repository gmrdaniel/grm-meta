
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettingsList } from "@/components/admin/notification-settings/NotificationSettingsList";
import { UnifiedNotificationSettings } from "@/components/admin/notification-settings/UnifiedNotificationSettings";

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState("list");
  
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Manage automated notifications for various project stages</p>
        </div>
        
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Notification Settings List</TabsTrigger>
            <TabsTrigger value="new">New Notification Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <NotificationSettingsList />
          </TabsContent>
          
          <TabsContent value="new" className="space-y-4">
            <UnifiedNotificationSettings 
              onSuccess={() => setActiveTab("list")} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}