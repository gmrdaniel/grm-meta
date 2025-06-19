ALTER TABLE notification_settings ADD COLUMN email_status text;

CREATE TABLE notification_logs(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id int8 REFERENCES notification_settings(campaign_id),
    campaign_name text REFERENCES notification_settings(campaign_name),
    notification_settings_id uuid REFERENCES notification_settings(id),
    user_email text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL);