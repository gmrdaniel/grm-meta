insert into social_media_platforms (name)
values 
  ('TikTok'),
  ('Pinterest'),
  ('Youtube'),
  ('Instagram')
on conflict (name) do nothing;
