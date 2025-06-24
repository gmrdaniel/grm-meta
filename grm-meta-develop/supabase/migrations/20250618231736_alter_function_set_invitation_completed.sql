CREATE OR REPLACE FUNCTION public.set_invitation_completed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try to update the invitation and log a notice if nothing was updated
  UPDATE public.creator_invitations
  SET status = 'completed',
      updated_at = NOW()
  WHERE email = NEW.email
    AND status IS DISTINCT FROM 'completed';

  -- Log instead of raising an exception
  IF NOT FOUND THEN
    RAISE NOTICE 'No invitation found or already completed for email: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$;
