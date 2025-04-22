create table project_social_media_platforms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  platform_id uuid not null references social_media_platforms(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (project_id, platform_id) -- Evita duplicar la misma relación
);
