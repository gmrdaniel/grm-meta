CREATE OR REPLACE FUNCTION set_default_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL AND NEW.current_stage_id IS NULL THEN
    SELECT id INTO NEW.current_stage_id
    FROM project_stages
    WHERE project_id = NEW.project_id
      AND order_index = 1;
      
    -- Si no existe un stage con index 1, current_stage_id se queda NULL
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
