DROP POLICY IF EXISTS "Creators can read" ON public.projects;

CREATE POLICY "Creators can read"
ON public.projects
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'creator'::user_role
  )
);