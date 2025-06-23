import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { EmptyStateCard } from "./components/EmptyStateCard";
import { NotificationSettingsHeader } from "./components/NotificationSettingsHeader";
import { NotificationSettingsTable } from "./components/NotificationSettingsTable";
import { NotificationSettingsPagination } from "./components/NotificationSettingsPagination";
import { NotificationSettingsSummary } from "./components/NotificationSettingsSummary";
import { EditNotificationSettings } from "./components/EditNotificationSettings";
import { useNotificationSettingsEvents } from "./hooks/useNotificationSettingsEvents";
import { toggleNotificationStatus, deleteNotificationSetting } from "./services/notificationSettingsService";
import { NotificationSetting } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NotificationSettingsCards } from "./components/NotificationSettingsCards";
import { UnifiedNotificationSettings } from "./UnifiedNotificationSettings";

interface Event {
  id: string;
  event_name: string;
}

interface NotificationSettingsListEventsProps {
  initialEventId?: string | null;
}

export function NotificationSettingsListEvents({ initialEventId }: NotificationSettingsListEventsProps) {
  const [editingSetting, setEditingSetting] = useState<NotificationSetting | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialEventId || null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  // Nuevo estado para controlar la creación de notificaciones
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  
  const {
    settings,
    isLoading,
    error,
    refetch,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalSettings,
    totalPages
  } = useNotificationSettingsEvents(selectedEventId);

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
  }, []);

  // Actualizar el evento seleccionado cuando cambia initialEventId
  useEffect(() => {
    if (initialEventId) {
      setSelectedEventId(initialEventId);
    }
  }, [initialEventId]);

  // Función para obtener la lista de eventos
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('invitation_events')
        .select('id, event_name')
        .order('event_name', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Reset to first page when changing page size or event
  useEffect(() => {
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, selectedEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCreateNotification = () => {
    setIsCreatingNotification(true);
  };

  if (isLoadingEvents) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (isLoading && selectedEventId) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <span>Error al cargar configuraciones de notificación: {error.message}</span>
      </div>
    );
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const success = await toggleNotificationStatus(id, currentStatus);
    if (success) refetch();
  };

  const handleDeleteSetting = async (id: string) => {
    const success = await deleteNotificationSetting(id);
    if (success) refetch();
  };

  const handleEditSetting = (setting: NotificationSetting) => {
    setEditingSetting(setting);
  };

  const handleEditSuccess = () => {
    setEditingSetting(null);
    refetch();
  };

  const handleEditCancel = () => {
    setEditingSetting(null);
  };

  // Nuevas funciones para manejar la creación de notificaciones
  const handleCreateSuccess = () => {
    setIsCreatingNotification(false);
    refetch();
  };

  const handleCreateCancel = () => {
    setIsCreatingNotification(false);
  };

  return (
    <div className="max-w-full space-y-4">
      {/* Selector de eventos */}
      <div className="bg-white shadow rounded-lg max-w-full p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full s">
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Evento</label>
            <Select
              value={selectedEventId || ""}
              onValueChange={handleEventChange}
              disabled={isLoadingEvents}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.event_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedEventId && !isCreatingNotification && !editingSetting && (
            <Button 
              onClick={handleCreateNotification}
              className="w-full md:w-auto"
            >
              <Plus size={16} className="mr-2" />
              Crear Notificación
            </Button>
          )}
        </div>
      </div>

      {editingSetting ? (
        <UnifiedNotificationSettings 
  isEditing={true}
  notificationSetting={editingSetting}
  onSuccess={handleEditSuccess}
  onCancel={handleEditCancel}
/>
      ) : isCreatingNotification ? (
          <UnifiedNotificationSettings 
  eventId={selectedEventId || ""}
  eventName={events.find(e => e.id === selectedEventId)?.event_name}
  onSuccess={handleCreateSuccess}
  onCancel={handleCreateCancel}
/>
      ) : (
        <>
          {selectedEventId ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <NotificationSettingsHeader 
                pageSize={pageSize} 
                onPageSizeChange={setPageSize} 
              />

              {!settings || settings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No hay configuraciones de notificación para este evento.</p>
                </div>
              ) : (
                <NotificationSettingsCards 
                  settings={settings} 
                  onToggleStatus={handleToggleStatus}
                  onDeleteSetting={handleDeleteSetting}
                  onEditSetting={handleEditSetting}
                />
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Selecciona un evento para ver sus configuraciones de notificación.</p>
            </div>
          )}
        </>
      )}

      {!editingSetting && !isCreatingNotification && selectedEventId && settings && settings.length > 0 && (
        <>
          <NotificationSettingsPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          
          <NotificationSettingsSummary 
            currentCount={settings?.length || 0}
            totalCount={totalSettings}
          />
        </>
      )}
    </div>
  );
}