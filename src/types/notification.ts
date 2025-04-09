
export type NotificationType = 'reminder' | 'notification' | 'alert';
export type NotificationChannel = 'sms' | 'email';
export type NotificationStatus = 'sent' | 'failed' | 'pending';

export interface NotificationSetting {
  id: string;
  type: NotificationType;
  subject: string | null;
  message: string;
  channel: NotificationChannel;
  enabled: boolean;
  delay_days: number;
  frequency_days: number;
  max_notifications: number;
  stage_id: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  error_message: string | null;
  sent_at: string;
  invitation_id: string;
  notification_setting_id: string;
  stage_id: string | null;
}
