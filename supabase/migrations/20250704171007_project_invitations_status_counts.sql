CREATE OR REPLACE FUNCTION public.get_admin_invitation_stats()
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  status TEXT,
  invitation_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.project_invitation_status_counts
  WHERE get_user_role(auth.uid()) = 'admin'::text;
$$;
