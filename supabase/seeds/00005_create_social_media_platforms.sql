insert into social_media_platforms (id, name)
values 
  ('a7c87d6e-2f7a-4e4c-bc1f-62b6c72e58a1', 'TikTok'),
  ('b9d6e81f-354b-4d6d-b6df-7233e7498b61', 'Pinterest'),
  ('c5f5d2ee-182f-4c3d-9ff9-74edbc6f405e', 'Youtube'),
  ('d4c8835e-d6e6-4c9f-b8c8-1b9e62bbd509', 'Instagram')
on conflict (name) do nothing;
