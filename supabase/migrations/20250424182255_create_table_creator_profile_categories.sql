CREATE TABLE creator_profile_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  UNIQUE (creator_profile_id, content_category_id)
);