insert into project_social_media_platforms (project_id, platform_id)
values 
  ('b1e23456-7f89-4abc-9d12-34567890abcd', 'd4c8835e-d6e6-4c9f-b8c8-1b9e62bbd509') -- Instagram
on conflict (project_id, platform_id) do nothing;