DROP POLICY IF EXISTS "Admins can view all creators" ON "public"."profiles";

CREATE POLICY "Admins can view all creators"
ON "public"."profiles"
TO public
USING (
  ((role = 'creator'::user_role) AND (get_user_role(auth.uid()) = 'admin'::text))
);
