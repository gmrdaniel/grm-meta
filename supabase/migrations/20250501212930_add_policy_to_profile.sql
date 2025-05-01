DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

CREATE POLICY "Enable update for users based on email"
  ON public.profiles
  FOR UPDATE
  TO public
  USING (((auth.jwt() ->> 'email') = email))
  WITH CHECK (((auth.jwt() ->> 'email') = email));
