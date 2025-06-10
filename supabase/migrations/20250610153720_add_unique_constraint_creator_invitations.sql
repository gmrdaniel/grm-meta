DROP INDEX IF EXISTS unique_email_ci;

CREATE UNIQUE INDEX unique_email_ci
ON creator_invitations (LOWER(email));
