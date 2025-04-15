
// import { supabase } from "@/integrations/supabase/client";
// import { NotificationLog } from "../types";

// export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
//   // Join with invitations, notification_settings, and project_stages to get more details
//   const { data, error } = await supabase
//     .from('notification_logs')
//     .select(`
//       *,
//       creator_invitations:invitation_id (email, full_name),
//       notification_settings:notification_setting_id (type, message),
//       project_stages:stage_id (name)
//     `)
//     .order('sent_at', { ascending: false });

//   if (error) throw error;

//   // Process the joined data to flatten the structure
//   return data.map((log: any) => ({
//     ...log,
//     invitation_email: log.creator_invitations?.email || null,
//     invitation_full_name: log.creator_invitations?.full_name || null,
//     setting_type: log.notification_settings?.type || null,
//     setting_message: log.notification_settings?.message || null,
//     stage_name: log.project_stages?.name || null,
//   }));
// }