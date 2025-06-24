ALTER TABLE creator_invitations
ADD COLUMN is_business_account BOOLEAN DEFAULT NULL,
ADD COLUMN is_professional_account BOOLEAN DEFAULT NULL;