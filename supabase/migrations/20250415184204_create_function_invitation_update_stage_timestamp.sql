CREATE OR REPLACE FUNCTION update_invitation_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id THEN
    NEW.stage_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
