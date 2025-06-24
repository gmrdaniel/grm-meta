ALTER TABLE public.creator_invitations 
ADD CONSTRAINT creator_invitations_email_project_unique 
UNIQUE (email, project_id);
