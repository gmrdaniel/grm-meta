-- Política para permitir a los administradores INSERTAR eventos
CREATE POLICY "Allow admin INSERT on invitation_events"
ON public.invitation_events
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

-- Política para permitir a los administradores ACTUALIZAR eventos
CREATE POLICY "Allow admin UPDATE on invitation_events"
ON public.invitation_events
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

-- Política para permitir a los administradores ELIMINAR eventos
CREATE POLICY "Allow admin DELETE on invitation_events"
ON public.invitation_events
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