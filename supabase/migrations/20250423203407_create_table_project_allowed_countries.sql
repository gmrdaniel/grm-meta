CREATE TABLE IF NOT EXISTS public.project_allowed_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    description TEXT, -- Opcional: para explicar por qué este país está habilitado en el proyecto
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (project_id, country_id)
);
