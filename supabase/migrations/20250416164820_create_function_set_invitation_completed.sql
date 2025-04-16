CREATE OR REPLACE FUNCTION set_invitation_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the status of the creator_invitations to 'completed'
    UPDATE creator_invitations
    SET status = 'completed'
    WHERE email = NEW.email
        AND status != 'completed';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function after a new profile is inserted
CREATE TRIGGER after_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW
WHEN (NEW.role = 'creator')
EXECUTE FUNCTION set_invitation_completed();