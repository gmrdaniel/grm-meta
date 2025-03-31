-- UP Migration: Add stage reference to creator_invitations with project validation
BEGIN;

-- Add new UUID column with foreign key
ALTER TABLE creator_invitations 
ADD COLUMN current_stage_id UUID REFERENCES project_stages(id);

-- Create validation function for project-stage relationship
CREATE OR REPLACE FUNCTION is_stage_in_project(stage_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_stages 
    WHERE id = stage_id AND project_id = is_stage_in_project.project_id
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraint to enforce project consistency
ALTER TABLE creator_invitations
ADD CONSTRAINT check_stage_belongs_to_project
CHECK (
  current_stage_id IS NULL OR 
  is_stage_in_project(current_stage_id, project_id)
);

COMMIT;

-- DOWN Migration: Rollback all changes
/*
BEGIN;

-- First remove the constraint
ALTER TABLE creator_invitations
DROP CONSTRAINT IF EXISTS check_stage_belongs_to_project;

-- Then remove the helper function
DROP FUNCTION IF EXISTS is_stage_in_project;

-- Finally remove the column
ALTER TABLE creator_invitations
DROP COLUMN IF EXISTS current_stage_id;

COMMIT;
*/