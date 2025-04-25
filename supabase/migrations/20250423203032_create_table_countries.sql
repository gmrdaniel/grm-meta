CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso2 VARCHAR(2) NOT NULL UNIQUE,
    iso3 VARCHAR(3) NOT NULL UNIQUE,
    name_es VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    phone_code VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 📝 Comentarios (descriptivos)
COMMENT ON TABLE public.countries IS 'Catálogo de países disponibles en la plataforma. Incluye códigos telefónicos, nombres en español e inglés.';
COMMENT ON COLUMN public.countries.id IS 'Identificador único del país (UUID).';
COMMENT ON COLUMN public.countries.iso2 IS 'Código ISO 3166-1 alfa-2 del país.';
COMMENT ON COLUMN public.countries.iso3 IS 'Código ISO 3166-1 alfa-3 del país.';
COMMENT ON COLUMN public.countries.name_es IS 'Nombre del país en español.';
COMMENT ON COLUMN public.countries.name_en IS 'Nombre del país en inglés.';
COMMENT ON COLUMN public.countries.phone_code IS 'Código telefónico internacional del país.';
COMMENT ON COLUMN public.countries.description IS 'Descripción opcional o información adicional del país.';
COMMENT ON COLUMN public.countries.created_at IS 'Fecha de creación del registro.';
COMMENT ON COLUMN public.countries.updated_at IS 'Fecha de última actualización del registro.';
