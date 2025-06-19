-- Añadir columnas para almacenar los días después y la hora
ALTER TABLE notification_settings 
ADD COLUMN days_after INTEGER,
ADD COLUMN time_hour TIME;

-- Añadir comentarios descriptivos
COMMENT ON COLUMN notification_settings.days_after IS 'Días después de la notificación anterior';
COMMENT ON COLUMN notification_settings.time_hour IS 'Hora programada para enviar la notificación';