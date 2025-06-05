import { supabase } from "@/integrations/supabase/client";

/**
 * Busca un evento de invitación a partir de un ID de notificación.
 * @param notifId ID de la notificación (notification_settings.id)
 * @returns El objeto del evento o null si no se encuentra.
 */
export async function fetchInvitationEventByNotification(notifId: string) {
  if (!notifId) return null;

  const { data: event, error: eventError } = await supabase
    .from("invitation_events")
    .select("*")
    .eq("id", notifId)
    .single();

  if (eventError) {
    console.error("Error fetching invitation event:", eventError);
    return null;
  }

  return event;
}
