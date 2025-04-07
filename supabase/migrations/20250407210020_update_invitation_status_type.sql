
-- Add 'accepted' as possible value to the invitation_status enum type if it doesn't exist
ALTER TYPE invitation_status ADD VALUE IF NOT EXISTS 'accepted';
