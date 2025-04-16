CREATE OR REPLACE FUNCTION set_invitation_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the status of the creator_invitations to 'completed'
    UPDATE public.creator_invitations
    SET status = 'completed',
        updated_at = NOW()
    WHERE email = NEW.email
      AND status != 'completed';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
