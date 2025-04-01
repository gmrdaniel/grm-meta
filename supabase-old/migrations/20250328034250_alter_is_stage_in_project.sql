/* ALTER TABLE creator_invitations
DROP CONSTRAINT IF EXISTS check_stage_belongs_to_project;

DROP FUNCTION IF EXISTS is_stage_in_project(UUID, UUID);

CREATE FUNCTION is_stage_in_project(stage_id UUID, project_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_stages ps
    WHERE ps.id = stage_id AND ps.project_id = project_id_param
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE creator_invitations
ADD CONSTRAINT check_stage_belongs_to_project
CHECK (
  current_stage_id IS NULL OR 
  is_stage_in_project(current_stage_id, project_id)
);
 */