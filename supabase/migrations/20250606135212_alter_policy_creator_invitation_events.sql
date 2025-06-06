ALTER TABLE public.creator_invitations_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin SELECT on creator_invitations_events"
ON public.creator_invitations_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  )
);

CREATE POLICY "Allow admin UPDATE on creator_invitations_events"
ON public.creator_invitations_events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  )
);

CREATE POLICY "Allow admin DELETE on creator_invitations_events"
ON public.creator_invitations_events
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  )
);

CREATE POLICY "Allow admin INSERT on creator_invitations_events"
ON public.creator_invitations_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  )
);
