DROP POLICY IF EXISTS "Creators can read" ON projects;

CREATE POLICY "Creators can read"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'creator'::user_role
    )
  ); 