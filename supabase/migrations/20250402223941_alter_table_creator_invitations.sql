-- Add fb_step_completed column to creator_invitations
ALTER TABLE creator_invitations
ADD COLUMN fb_step_completed boolean DEFAULT false NOT NULL;