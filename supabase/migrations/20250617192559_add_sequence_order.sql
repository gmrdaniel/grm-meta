DO $$
BEGIN
  BEGIN
    ALTER TABLE notification_settings ADD COLUMN sequence_order INTEGER;
  EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'column sequence_order already exists in notification_settings';
  END;
END;
$$;