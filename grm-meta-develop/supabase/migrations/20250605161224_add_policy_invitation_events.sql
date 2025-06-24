GRANT
SELECT
    ON invitation_events TO anon;

-- Habilitar RLS si no lo está aún
ALTER TABLE invitation_events ENABLE ROW LEVEL SECURITY;

-- Crear una política pública de lectura
CREATE POLICY "Allow public read" ON invitation_events FOR
SELECT
    TO anon USING (true);