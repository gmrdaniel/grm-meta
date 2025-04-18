CREATE OR REPLACE FUNCTION set_default_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL AND NEW.current_stage_id IS NULL THEN
    SELECT id INTO NEW.current_stage_id
    FROM public.project_stages
    WHERE project_id = NEW.project_id
      AND order_index = 1;

    -- Si asignamos un stage, también actualizamos la fecha
    IF NEW.current_stage_id IS NOT NULL THEN
      NEW.stage_updated_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
