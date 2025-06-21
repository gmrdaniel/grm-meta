DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'invitation_status'
      AND e.enumlabel = 'approved'
  ) THEN
    ALTER TYPE invitation_status ADD VALUE 'approved';
  END IF;
END
$$;