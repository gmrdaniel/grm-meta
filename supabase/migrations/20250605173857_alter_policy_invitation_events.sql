ALTER POLICY "Allow public read"
ON "public"."invitation_events"
RENAME TO "Enable read access for all users";
