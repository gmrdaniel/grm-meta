-- Crear tabla content_categories
CREATE TABLE content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,                 
  name_es TEXT NOT NULL,                   -- Nombre en español
  name_en TEXT NOT NULL,                   -- Nombre en inglés
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
