GRANT
SELECT
    ON notification_settings TO anon;

-- Habilitar RLS si no lo está aún
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Crear una política pública de lectura
CREATE POLICY "Allow public read" ON notification_settings FOR
SELECT
    TO anon USING (true);