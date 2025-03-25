
import { useState } from "react";
import { Creator } from "@/types/creator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreatorForm } from "@/components/admin/inventory/CreatorForm";
import { TikTokVideosList } from "@/components/admin/inventory/TikTokVideosList";

interface CreatorDetailProps {
  creator: Creator;
  onBack: () => void;
  onUpdate: () => void;
}

export function CreatorDetail({ creator, onBack, onUpdate }: CreatorDetailProps) {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {creator.nombre} {creator.apellido}
        </h2>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="tiktok-videos">Videos TikTok</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <CreatorForm 
            initialData={creator}
            onSuccess={() => {
              onUpdate();
              setActiveTab("profile");
            }}
          />
        </TabsContent>
        
        <TabsContent value="tiktok-videos" className="space-y-6">
          <TikTokVideosList creatorId={creator.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
