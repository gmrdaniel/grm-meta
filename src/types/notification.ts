
export interface NotificationSetting {
  id: string;
  type: "reminder" | "notification" | "alert";
  subject: string;
  message: string;
  channel: "email" | "sms";
  enabled: boolean;
  delay_days: number;
  frequency_days: number;
  max_notifications: number;
  stage_id: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  notification_setting_id: string;
  recipient_id: string;
  recipient_type: string;
  channel: string;
  status: string;
  sent_at: string;
  error_message?: string;
  notification_settings?: NotificationSetting;
  creator_invitations?: {
    full_name: string;
    email: string;
  };
  project_stages?: {
    name: string;
  };
}
