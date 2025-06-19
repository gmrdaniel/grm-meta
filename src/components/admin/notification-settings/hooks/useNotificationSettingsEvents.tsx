import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationSetting } from "../types";

export const useNotificationSettingsEvents = (eventId: string | null) => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { data: allSettings, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-settings-events', eventId],
    queryFn: () => fetchNotificationSettingsByEvent(eventId),
    enabled: !!eventId, // Solo ejecutar la consulta si hay un eventId
  });

  // Calculate pagination
  const totalSettings = allSettings?.length || 0;
  const totalPages = Math.ceil(totalSettings / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const settings = allSettings?.slice(startIndex, startIndex + pageSize);

  return {
    settings,
    allSettings,
    isLoading,
    error,
    refetch,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalSettings,
    totalPages,
    startIndex
  };
};

async function fetchNotificationSettingsByEvent(eventId: string | null) {
  if (!eventId) return [];
  
  // Join with project_stages to get stage names and filter by event ID
  const { data, error } = await supabase
    .from('notification_settings')
    .select(`
      *,
      project_stages:stage_id (name)
    `)
    .eq('invitation_event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Process the joined data to flatten the structure
  return data.map((setting: any) => ({
    ...setting,
    stage_name: setting.project_stages?.name || null,
  }));
}