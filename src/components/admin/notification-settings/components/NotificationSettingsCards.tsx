import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Pencil, Trash, Bell, Mail } from "lucide-react";
import { NotificationSetting } from "../types";
import { getTypeColor, getChannelColor } from "../utils/notificationUtils";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TestEmailDialog } from "./TestEmailDialog";

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
import { toggleNotificationStatus, deleteNotificationSetting, updateNotificationConfig } from "../services/notificationSettingsService";

export const NotificationSettingsCards = ({
  settings,
  onToggleStatus,
  onDeleteSetting,
  onEditSetting
}: NotificationSettingsCardsProps) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<NotificationSetting | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("pending");
  const [statusEmail, setStatusEmail] = useState<string>("");
  const [previousEmail, setPreviousEmail] = useState<string>("");
  const [daysAfter, setDaysAfter] = useState<string>("2");
  const [timeHour, setTimeHour] = useState<string>("00:00");
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmailSetting, setTestEmailSetting] = useState<NotificationSetting | null>(null);
  
  // Verificar si se ha seleccionado un email anterior
  const isPreviousEmailSelected = previousEmail !== null && previousEmail !== "none";
  
  // Resetear los valores cuando cambia el email seleccionado
  useEffect(() => {
    if (!isPreviousEmailSelected) {
      setDaysAfter("2");
      setTimeHour("00:00");
    }
  }, [previousEmail]);

  const handleOpenConfigModal = (setting: NotificationSetting) => {
    setSelectedSetting(setting);
    // Resetear los valores al abrir el modal
    setTargetStatus("pending");
    setStatusEmail("none"); // Changed from empty string to "none"
    setPreviousEmail("none"); // Changed from empty string to "none"
    setDaysAfter("2");
    setTimeHour("00:00");
    setIsConfigModalOpen(true);
  };


  if (!settings || settings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No hay configuraciones de notificación para este evento.</p>
      </div>
    );
  }
  const handleOpenTestEmailDialog = (setting: NotificationSetting) => {
    setTestEmailSetting(setting);
    setIsTestEmailDialogOpen(true);
  };
  const handleSaveConfig = async () => {
            if (!selectedSetting) return;
            
            // Convertir daysAfter a número o null
            let daysAfterValue: number | null = null;
            if (isPreviousEmailSelected && daysAfter) {
              daysAfterValue = parseInt(daysAfter, 10);
            }
            
            // Convertir timeHour a string o null
            let timeHourValue: string | null = null;
            if (isPreviousEmailSelected && timeHour) {
              timeHourValue = timeHour;
            }
            
            // Determinar el sequence_order basado en el previousEmail
            let sequenceOrder: number | null = null;
            if (previousEmail && previousEmail !== "none") {
              // Si previousEmail es "null", dejamos sequenceOrder como null
              if (previousEmail !== "null") {
                sequenceOrder = parseInt(previousEmail, 10) + 1;
              }
            }
            
            const success = await updateNotificationConfig(selectedSetting.id, {
              target_status: targetStatus,
              sequence_order: sequenceOrder,
              email_status: statusEmail,
              days_after: daysAfterValue,
              time_hour: timeHourValue
            });
            
            if (success) {
              setIsConfigModalOpen(false);
              // Si existe una función para refrescar los datos, la llamamos aquí
              // Por ejemplo: onRefresh && onRefresh();
            }
          };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 p-4">
        {settings
          .slice() // Crear una copia para no modificar el array original
          .sort((a, b) => {
            // Manejar casos donde sequence_order puede ser null
            const orderA = a.sequence_order !== null ? a.sequence_order : Infinity;
            const orderB = b.sequence_order !== null ? b.sequence_order : Infinity;
            return orderA - orderB; // Ordenamiento ascendente
          })
          .map((setting) => (
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
                
                <div className="w-full grid grid-cols-2 gap-2">
                  {setting.channel === "email" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenTestEmailDialog(setting)}
                      className="flex items-center justify-start"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Probar envío
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenConfigModal(setting)}
                    className="flex items-center justify-start"
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Configurar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditSetting(setting)}
                    className="flex items-center justify-start"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 flex items-center justify-start"
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

      {/* Modal de configuración de envío de notificación */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-screen-md">
          <DialogHeader>
            <DialogTitle>Configuración de envío de notificación</DialogTitle>
            {selectedSetting?.campaign_name && (
              <p className="text-sm text-gray-500">{selectedSetting.campaign_name}</p>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Select para email anterior */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="previous_email" className="text-right font-medium col-span-1">
                Notificación anterior
              </label>
              <div className="col-span-3">
                <Select value={previousEmail} onValueChange={setPreviousEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar email anterior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null} >Seleccionar email anterior</SelectItem>
                    {settings?.map((notification) => (
                      <SelectItem key={notification.id} value={notification.sequence_order?.toString() || "null"}>
                        {notification.campaign_name || `Notificación ${notification.sequence_order}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campo de días después - solo visible cuando hay email anterior seleccionado */}
            {isPreviousEmailSelected &&(
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="days_after" className="text-right font-medium col-span-1">
                  Días después
                </label>
                <div className="col-span-3">
                  <Input
                    id="days_after"
                    type="number"
                    value={daysAfter}
                    onChange={(e) => setDaysAfter(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* Campo de hora - solo visible cuando hay email anterior seleccionado */}
            {isPreviousEmailSelected && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="time_hour" className="text-right font-medium col-span-1">
                  Hora
                </label>
                <div className="col-span-3">
                  <Input
                    id="time_hour"
                    type="time"
                    value={timeHour}
                    onChange={(e) => setTimeHour(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="target_status" className="text-right font-medium col-span-1">
                Target Status
              </label>
              <div className="col-span-3">
                <Select value={targetStatus} onValueChange={setTargetStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="accepted">accepted</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                    <SelectItem value="sended">sended</SelectItem>
                    <SelectItem value="in process">in process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status_email" className="text-right font-medium col-span-1">
                Status Email
              </label>
              <div className="col-span-3">
                <Select value={statusEmail} onValueChange={setStatusEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado de email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    <SelectItem value="sent">sent</SelectItem>
                    <SelectItem value="opened">opened</SelectItem>
                    <SelectItem value="clicked">clicked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          
          <DialogFooter>
            <Button type="button" onClick={() => setIsConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="default" onClick={handleSaveConfig}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de prueba de envío de correo */}
      {testEmailSetting && (
        <TestEmailDialog 
          subject={testEmailSetting.subject || ""}
          message={testEmailSetting.message}
          isOpen={isTestEmailDialogOpen}
          onOpenChange={setIsTestEmailDialogOpen}
        />
      )}
    </>
    
  );

  
};