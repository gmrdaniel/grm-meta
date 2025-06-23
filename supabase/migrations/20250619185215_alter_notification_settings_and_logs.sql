ALTER TABLE notification_settings ADD COLUMN email_status text;

ALTER TABLE notification_logs ADD COLUMN campaign_id BIGINT;
ALTER TABLE notification_logs ADD COLUMN campaign_name TEXT;

COMMENT ON COLUMN notification_logs.campaign_id IS 'ID de campaña en Mailjet, referencia a notification_settings';
COMMENT ON COLUMN notification_logs.campaign_name IS 'Nombre de la campaña en Mailjet, referencia a notification_settings';