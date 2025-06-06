ALTER TABLE public.creator_invitations_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin SELECT UPDATE DELETE on creator_invitations_events"
ON public.creator_invitations_events
FOR SELECT, UPDATE, DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  )
);
