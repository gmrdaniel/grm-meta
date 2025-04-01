
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvitationServiceTab from "./tabs/InvitationServiceTab";
import DirectRpcTab from "./tabs/DirectRpcTab";
import TikTokApiTab from "./tabs/TikTokApiTab";
import TikTokVideoApiTab from "./tabs/TikTokVideoApiTab";
import FacebookApiTabs from "./tabs/FacebookApiTabs";
import YouTubeApiTab from "./tabs/YouTubeApiTab";

export default function TestTabs() {
  return (
    <Tabs defaultValue="service" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="service">Usando Servicio</TabsTrigger>
        <TabsTrigger value="direct">Llamada Directa RPC</TabsTrigger>
        <TabsTrigger value="tiktok">TikTok API</TabsTrigger>
        <TabsTrigger value="tiktok-video">TikTok Video API</TabsTrigger>
        <TabsTrigger value="facebook">Facebook API</TabsTrigger>
        <TabsTrigger value="youtube">YouTube</TabsTrigger>
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
        <TikTokVideoApiTab />
      </TabsContent>
      
      <TabsContent value="facebook">
        <FacebookApiTabs />
      </TabsContent>
      
      <TabsContent value="youtube">
        <YouTubeApiTab />
      </TabsContent>
    </Tabs>
  );
}
