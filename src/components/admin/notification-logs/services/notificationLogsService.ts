
import { supabase } from "@/integrations/supabase/client";
import { NotificationLog } from "../types";

export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
  // Join with invitations, notification_settings, and project_stages to get more details
  const { data, error } = await supabase
    .from("notification_logs")
    .select(
      `
      *,
      creator_invitations:invitation_id (email, first_name,last_name,created_at,stage_updated_at),
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
    invitation_created_at: log.creator_invitations?.created_at || null,
    invitation_stage_updated_at: log.creator_invitations?.stage_updated_at || null,
    setting_type: log.notification_settings?.type || null,
    setting_message: log.notification_settings?.message || null,
    stage_name: log.project_stages?.name || null,
    stage_order_index: log.project_stages?.order_index ?? null,
    last_name: log.creator_invitations?.last_name || null,
  }));
}
