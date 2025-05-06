CREATE TABLE profile_projects (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (profile_id, project_id)
);
