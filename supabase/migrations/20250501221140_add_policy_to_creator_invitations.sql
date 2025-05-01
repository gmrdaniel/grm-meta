DROP POLICY IF EXISTS "Enable update for users based on email" ON public.creator_invitations;

CREATE POLICY "Enable update for users based on email"
ON public.creator_invitations
FOR UPDATE
TO public
USING (
  (SELECT auth.jwt() ->> 'email') = email
)
WITH CHECK (
  (SELECT auth.jwt() ->> 'email') = email
);
