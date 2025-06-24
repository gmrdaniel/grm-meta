CREATE TABLE social_media_profile (
  id UUID PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  social_media_platform_id UUID NOT NULL REFERENCES social_media_platforms(id),
  username TEXT NOT NULL,
  followers BIGINT DEFAULT 0,
  following BIGINT DEFAULT 0,
  bio TEXT,
  engagement_rate NUMERIC(5,2),
  website TEXT,
  total_likes BIGINT DEFAULT 0,
  monthly_views BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  company_trained BOOLEAN DEFAULT FALSE,
  quality creator_quality,
  UNIQUE (creator_id, social_media_platform_id)
);
