
export type NotificationSetting = {
    id: string;
    type: "reminder" | "notification" | "alert";
    subject: string | null;
    message: string;
    channel: "email" | "sms";
    enabled: boolean;
    delay_days: number;
    frequency_days: number;
    max_notifications: number;
    stage_id: string | null;
    created_at: string;
    stage_name?: string;
    sequence_order?: number | null;
    campaign_name?: string | null;
    invitation_event_id?: string | null;
  };