
ALTER TABLE notification_settings
ADD COLUMN invitation_event_id UUID;

ALTER TABLE notification_settings
ADD CONSTRAINT fk_notification_settings_invitation_event
FOREIGN KEY (invitation_event_id) 
REFERENCES invitation_events(id)
ON DELETE SET NULL; 

-- Añadir las nuevas columnas (ambas permiten NULL si no especificas lo contrario)
ALTER TABLE notification_settings
ADD COLUMN campaign_id BIGINT,
ADD COLUMN campaign_name TEXT;

--Añadir comentarios descriptivos (documentación)
COMMENT ON COLUMN notification_settings.campaign_id IS 'ID de campaña en Mailjet';
COMMENT ON COLUMN notification_settings.campaign_name IS 'Nombre de la campaña en Mailjet';

ALTER TABLE invitation_events
ADD COLUMN event_name TEXT;

ALTER TABLE invitation_events
ALTER COLUMN event_name SET NOT NULL;

ALTER TABLE invitation_events
DROP COLUMN campaign_id,
DROP COLUMN campaign_name;