CREATE TRIGGER create_validation_task_on_invitation_accept_trigger AFTER UPDATE ON public.creator_invitations FOR EACH ROW EXECUTE FUNCTION create_validation_task_on_invitation_accept();

CREATE TRIGGER create_validation_task_on_invitation_insert_trigger AFTER INSERT ON public.creator_invitations FOR EACH ROW WHEN ((new.status = 'accepted'::invitation_status)) EXECUTE FUNCTION create_validation_task_on_invitation_accept();

CREATE TRIGGER validate_task_roles_trigger BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION validate_task_roles();


