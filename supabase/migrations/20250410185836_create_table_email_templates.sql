-- ========================================
-- Tabla: email_templates
-- Guarda las plantillas HTML base de emails con {{body}} como placeholder
-- ========================================
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),

  -- Nombre legible o identificador único (por ejemplo: 'default_frame')
  name text not null unique,

  -- Plantilla HTML completa que debe incluir {{body}} como marcador
  html text not null,

  -- Fecha de creación del template
  created_at timestamp with time zone default now()
);

comment on table public.email_templates is
  'Contiene plantillas HTML de email reutilizables con marcador {{body}} para insertar contenido dinámico.';

comment on column public.email_templates.name is
  'Identificador legible de la plantilla (ej. "default_frame").';

comment on column public.email_templates.html is
  'Contenido HTML completo de la plantilla con {{body}} como marcador.';

comment on column public.email_templates.created_at is
  'Fecha de creación del registro.';