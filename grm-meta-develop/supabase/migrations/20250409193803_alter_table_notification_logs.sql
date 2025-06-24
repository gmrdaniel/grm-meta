-- Agrega columnas de auditoría
ALTER TABLE notification_logs
ADD COLUMN created_at timestamp with time zone default now(),
ADD COLUMN updated_at timestamp with time zone default now();

-- Elimina default de sent_at (para control manual desde cron de envío)
ALTER TABLE notification_logs
ALTER COLUMN sent_at DROP DEFAULT;
