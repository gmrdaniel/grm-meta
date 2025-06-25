DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='creator_invitations' 
      AND column_name='fb_profile_id'
  ) THEN
    ALTER TABLE public.creator_invitations
    ADD COLUMN fb_profile_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='creator_invitations' 
      AND column_name='fb_profile_owner_id'
  ) THEN
    ALTER TABLE public.creator_invitations
    ADD COLUMN fb_profile_owner_id TEXT;
  END IF;
END $$;
