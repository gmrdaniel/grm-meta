-- Create invitation_events table
CREATE TABLE IF NOT EXISTS invitation_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_project UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL
);

-- Add registration_event_id column to creator_invitations
ALTER TABLE creator_invitations
ADD COLUMN registration_notification_id UUID;

-- Add foreign key constraint to creator_invitations
ALTER TABLE creator_invitations
ADD CONSTRAINT fk_registration_notification
FOREIGN KEY (registration_notification_id)
REFERENCES notification_settings(id)
ON DELETE SET NULL;

-- Create creator_invitations_events table
CREATE TABLE IF NOT EXISTS creator_invitations_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_invitation_id UUID NOT NULL REFERENCES creator_invitations(id) ON DELETE CASCADE,
    invitation_event_id UUID NOT NULL REFERENCES invitation_events(id) ON DELETE CASCADE,
    sending_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Prevent duplicate relationships
    UNIQUE (creator_invitation_id, invitation_event_id)
);