ALTER TABLE profile_projects
ADD COLUMN status TEXT CHECK (status IN ('approved', 'rejected')) DEFAULT 'approved';