ALTER TABLE profile_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view profile_projects"
ON profile_projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert profile_projects"
ON profile_projects
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role(auth.uid()) = 'admin'
);
