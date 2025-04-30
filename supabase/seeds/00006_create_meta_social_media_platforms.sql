-- Meta Campaign: TikTok, Pinterest, Youtube
insert into project_social_media_platforms (project_id, platform_id)
values 
  ('cf7f3465-2b30-4cb7-8b55-c5ab10b00505', 'a7c87d6e-2f7a-4e4c-bc1f-62b6c72e58a1'), -- TikTok
  ('cf7f3465-2b30-4cb7-8b55-c5ab10b00505', 'b9d6e81f-354b-4d6d-b6df-7233e7498b61'), -- Pinterest
  ('cf7f3465-2b30-4cb7-8b55-c5ab10b00505', 'c5f5d2ee-182f-4c3d-9ff9-74edbc6f405e')  -- Youtube
on conflict (project_id, platform_id) do nothing;