import { supabase } from "@/integrations/supabase/client";
import { NotificationLog } from "../types";

export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
  // Join with invitations, notification_settings, and project_stages to get more details
  const { data, error } = await supabase
    // @ts-expect-error:  tabla no incluida en el tipado de supabase aún
    .from("notification_logs")

    .select(
      `
      *,
      creator_invitations:invitation_id (email, first_name),
      notification_settings:notification_setting_id (type, message),
      project_stages:stage_id (name, order_index)
    `
    )
    .order("sent_at", { ascending: false });

  if (error) throw error;

  // Process the joined data to flatten the structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((log: any) => ({
    ...log,
    invitation_email: log.creator_invitations?.email || null,
    invitation_first_name: log.creator_invitations?.first_name || null,
    setting_type: log.notification_settings?.type || null,
    setting_message: log.notification_settings?.message || null,
    stage_name: log.project_stages?.name || null,
    stage_order_index: log.project_stages?.order_index ?? null,
  }));
}
