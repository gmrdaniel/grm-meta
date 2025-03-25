
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TikTokImportTemplate } from "./import-templates/TikTokImportTemplate";
import { toast } from "sonner";

interface ImportCreatorsProps {
  onSuccess?: () => void;
}

export function ImportCreators({ onSuccess }: ImportCreatorsProps) {
  const [activeTab, setActiveTab] = useState("templates");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Importar Creadores</h2>
        <p className="text-gray-500">Importa creadores utilizando plantillas predefinidas o personaliza tu propia importación</p>
      </div>
      
      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial de Importaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>Usuario TikTok</CardTitle>
                <CardDescription>
                  Importa creadores con sus datos básicos y usuario de TikTok
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Incluye: nombre, apellido, correo, usuario_tiktok
                </p>
                <Button 
                  onClick={() => setActiveTab("tiktok-template")}
                  variant="outline"
                  className="w-full"
                >
                  Usar plantilla
                </Button>
              </CardContent>
            </Card>
            
            {/* Placeholder for future templates */}
            <Card className="bg-gray-50 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400">Próximamente</CardTitle>
                <CardDescription className="text-gray-400">
                  Más plantillas de importación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Plantillas para otros tipos de creadores
                </p>
                <Button 
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  No disponible
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Importaciones</CardTitle>
              <CardDescription>
                Revisa tus importaciones recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-6">
                No hay importaciones recientes
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tiktok-template" className="pt-4">
          <TikTokImportTemplate onSuccess={() => {
            setActiveTab("templates");
            if (onSuccess) onSuccess();
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
