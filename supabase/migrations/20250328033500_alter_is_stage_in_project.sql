CREATE OR REPLACE FUNCTION is_stage_in_project(stage_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_stages ps
    WHERE ps.id = stage_id AND ps.project_id = project_id
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
