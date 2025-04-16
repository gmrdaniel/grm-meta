ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- select
CREATE POLICY "Admins can read notification logs"
ON notification_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- insert 

CREATE POLICY "Admins can insert notification logs"
ON notification_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- update

CREATE POLICY "Admins can update notification logs"
ON notification_logs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

