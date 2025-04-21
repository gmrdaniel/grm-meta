
export type NotificationLog = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    created_at(created_at: any): import("react").ReactNode;
    id: string;
    channel: "email" | "sms";
    status: "sent" | "failed" | "pending";
    error_message: string | null;
    sent_at: string;
    invitation_id: string;
    notification_setting_id: string;
    stage_id: string | null;
    // Joined data
    invitation_email?: string;
    invitation_first_name?: string;
    setting_type?: string;
    setting_message?: string;
    stage_name?: string;
    stage_order_index?: number | null;
    invitation_created_at?: string | null;
    invitation_stage_updated_at?: string | null;
    last_name?: string | null;

  };