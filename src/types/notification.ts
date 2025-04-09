
import { Database } from "@/integrations/supabase/types";

export type NotificationTypes = Database["public"]["Enums"]["notification_types"];
export type NotificationStatus = Database["public"]["Enums"]["notification_status"];
export type NotificationChannel = Database["public"]["Enums"]["notification_channel"];

export interface NotificationLog {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  error_message?: string | null;
  sent_at: string;
  invitation_id: string;
  notification_setting_id: string;
  stage_id?: string | null;
  
  // Joined data
  invitation?: {
    full_name: string;
    email: string;
  } | null;
  stage?: {
    name: string;
  } | null;
  notification_setting?: {
    subject: string;
    message: string;
    type: NotificationTypes;
  } | null;
}

export interface NotificationSetting {
  id: string;
  type: NotificationTypes;
  subject?: string | null;
  message: string;
  channel: NotificationChannel;
  enabled: boolean;
  delay_days: number;
  frequency_days: number;
  max_notifications: number;
  stage_id: string;
  created_at: string;
}
