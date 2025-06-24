ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

--select
CREATE POLICY "Admins can read all notification settings"
ON notification_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

--insert
CREATE POLICY "Admins can insert notification settings"
ON notification_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


--update
CREATE POLICY "Admins can update notification settings"
ON notification_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);



