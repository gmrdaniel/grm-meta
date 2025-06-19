import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { NotificationSetting } from "../types";
import { getTypeColor, getChannelColor } from "../utils/notificationUtils";

interface NotificationSettingsCardsProps {
  settings: NotificationSetting[] | undefined;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDeleteSetting: (id: string) => void;
  onEditSetting: (setting: NotificationSetting) => void;
}

// Función para renderizar HTML de forma segura
const HtmlPreview = ({ html }: { html: string }) => {
  return (
    <div 
      className="border rounded-md p-4 bg-gray-50 max-h-48 overflow-auto" 
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const NotificationSettingsCards = ({
  settings,
  onToggleStatus,
  onDeleteSetting,
  onEditSetting
}: NotificationSettingsCardsProps) => {
  if (!settings || settings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No hay configuraciones de notificación para este evento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 p-4">
      {settings.map((setting) => (
        <Card key={setting.id} className="overflow-hidden h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className={getTypeColor(setting.type)}>
                {setting.type}
              </Badge>
              <Switch 
                checked={setting.enabled} 
                onCheckedChange={() => onToggleStatus(setting.id, setting.enabled)} 
              />
            </div>
            {setting.subject && (
              <div className="mt-2 font-medium">{setting.subject}</div>
            )}
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="mb-4">
              <HtmlPreview html={setting.message} />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start pt-0">
            <div className="w-full flex flex-col gap-2 mb-3">
              {setting.campaign_name && (
                <div className="text-sm">
                  <span className="font-medium">Campaña:</span> {setting.campaign_name}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">Canal:</span> 
                <Badge variant="outline" className={`ml-2 ${getChannelColor(setting.channel)}`}>
                  {setting.channel}
                </Badge>
              </div>
              {/* Añadir círculo con número de secuencia */}
              <div className="text-sm flex items-center">
                <div className="ml-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {setting.sequence_order !== null ? setting.sequence_order : '-'}
                </div>
              </div>
              {setting.stage_name && (
                <div className="text-sm">
                  <span className="font-medium">Etapa:</span> {setting.stage_name || 'Todas'}
                </div>
              )}
            </div>
            
            <div className="w-full flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEditSetting(setting)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700"
                onClick={() => onDeleteSetting(setting.id)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};