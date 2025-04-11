-- ========================================
-- Extensión: notification_settings.template_id
-- Relación opcional con una plantilla de email
-- ========================================
alter table public.notification_settings
add column if not exists template_id uuid references public.email_templates(id) on delete set null;

comment on column public.notification_settings.template_id is
  'Referencia opcional a una plantilla de email HTML para envolver el mensaje dinámico.';