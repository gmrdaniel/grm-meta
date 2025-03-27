
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceAlert } from "@/components/admin/test/ServiceAlert";
import { InvitationTest } from "@/components/admin/test/InvitationTest";
import { TikTokTest } from "@/components/admin/test/TikTokTest";
import { FacebookPageForm } from "@/components/admin/test/FacebookPageForm";
import { FacebookCustomReels } from "@/components/admin/test/FacebookCustomReels";

export default function AdminTestPage() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Pruebas (Admin)</h1>
        
        <ServiceAlert />
        
        <Tabs defaultValue="service" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="service">Usando Servicio</TabsTrigger>
            <TabsTrigger value="direct">Llamada Directa RPC</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok API</TabsTrigger>
            <TabsTrigger value="tiktok-video">TikTok Video</TabsTrigger>
            <TabsTrigger value="facebook-page">Facebook Page</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service">
            <InvitationTest />
          </TabsContent>
          
          <TabsContent value="direct">
            <InvitationTest />
          </TabsContent>
          
          <TabsContent value="tiktok">
            <TikTokTest />
          </TabsContent>
          
          <TabsContent value="tiktok-video">
            <TikTokTest />
          </TabsContent>
          
          <TabsContent value="facebook-page">
            <div className="grid gap-6 md:grid-cols-2">
              <FacebookPageForm />
              <FacebookCustomReels />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
