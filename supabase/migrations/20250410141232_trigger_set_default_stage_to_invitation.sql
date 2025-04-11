CREATE TRIGGER set_default_stage_trigger
BEFORE INSERT ON creator_invitations
FOR EACH ROW
EXECUTE FUNCTION set_default_stage();
