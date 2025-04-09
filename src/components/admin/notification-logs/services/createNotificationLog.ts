
import { supabase } from "@/integrations/supabase/client";
import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";

export async function createNotificationLog(values: NotificationLogFormValues): Promise<void> {
  const { error } = await supabase
    .from("notification_logs")
    .insert({
      invitation_id: values.invitation_id,
      notification_setting_id: values.notification_setting_id,
      stage_id: values.stage_id,
      channel: values.channel,
      status: values.status,
      error_message: values.error_message || null,
    });

  if (error) throw error;
}
