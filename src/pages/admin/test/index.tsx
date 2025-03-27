
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeAlert } from "@/components/admin/test/WelcomeAlert";
import { InvitationServiceTab } from "@/components/admin/test/InvitationServiceTab";
import { DirectRpcTab } from "@/components/admin/test/DirectRpcTab";
import { TikTokApiTab } from "@/components/admin/test/TikTokApiTab";
import { TikTokVideoTab } from "@/components/admin/test/TikTokVideoTab";
import { FacebookPageTab } from "@/components/admin/test/FacebookPageTab";

export default function AdminTestPage() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Pruebas (Admin)</h1>
        
        <WelcomeAlert />
        
        <Tabs defaultValue="service" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="service">Usando Servicio</TabsTrigger>
            <TabsTrigger value="direct">Llamada Directa RPC</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok API</TabsTrigger>
            <TabsTrigger value="tiktok-video">TikTok Video</TabsTrigger>
            <TabsTrigger value="facebook-page">Facebook Page</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service">
            <InvitationServiceTab />
          </TabsContent>
          
          <TabsContent value="direct">
            <DirectRpcTab />
          </TabsContent>
          
          <TabsContent value="tiktok">
            <TikTokApiTab />
          </TabsContent>
          
          <TabsContent value="tiktok-video">
            <TikTokVideoTab />
          </TabsContent>
          
          <TabsContent value="facebook-page">
            <FacebookPageTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
