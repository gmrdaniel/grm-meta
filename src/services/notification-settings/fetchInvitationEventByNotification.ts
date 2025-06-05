/**
 * Busca un evento de invitación a partir de un ID de notificación.
 * @param notifId ID de la notificación (notification_settings.id)
 * @returns El objeto del evento o null si no se encuentra.
 */
export async function fetchInvitationEventByNotification(notifId: string) {
  if (!notifId) return null;

  // Paso 1: Buscar la notificación para obtener el invitation_event_id
  const { data: notification, error: notifError } = await supabase
    .from("notification_settings")
    .select("invitation_event_id")
    .eq("id", notifId)
    .single();
    
  if (notifError || !notification?.invitation_event_id) {
    console.error("Error fetching notification or missing invitation_event_id:", notifError);
    return null;
  }

  // Paso 2: Buscar el evento en invitation_events
  const { data: event, error: eventError } = await supabase
    .from("invitation_events")
    .select("*")
    .eq("id", notification.invitation_event_id)
    .single();

  if (eventError) {
    console.error("Error fetching invitation event:", eventError);
    return null;
  }

  return event;
}
