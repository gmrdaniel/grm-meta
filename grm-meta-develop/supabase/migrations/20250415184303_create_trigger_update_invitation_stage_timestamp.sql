CREATE TRIGGER trigger_update_stage_timestamp
BEFORE UPDATE ON creator_invitations
FOR EACH ROW
EXECUTE FUNCTION update_invitation_stage_timestamp();
