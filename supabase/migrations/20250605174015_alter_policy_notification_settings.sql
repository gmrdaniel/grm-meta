ALTER POLICY "Allow public read"
ON "public"."notification_settings"
RENAME TO "Enable read access for all users";
