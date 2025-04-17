ALTER TABLE public.creator_invitations
RENAME COLUMN full_name TO first_name;

ALTER TABLE public.creator_invitations
ADD COLUMN last_name TEXT;
