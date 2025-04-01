CREATE OR REPLACE FUNCTION public.update_stages_order(stages_data json[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  stage json;
BEGIN
  FOREACH stage IN ARRAY stages_data
  LOOP
    UPDATE public.project_stages
    SET order_index = (stage->>'order_index')::integer
    WHERE id = (stage->>'id')::uuid;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_task_roles()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  creator_role TEXT;
  admin_role TEXT;
BEGIN
  -- Check creator role if provided
  IF NEW.creator_id IS NOT NULL THEN
    SELECT role INTO creator_role FROM public.profiles WHERE id = NEW.creator_id;
    IF creator_role != 'creator' THEN
      RAISE EXCEPTION 'Creator must have the creator role';
    END IF;
  END IF;
  
  -- Check admin role if provided
  IF NEW.admin_id IS NOT NULL THEN
    SELECT role INTO admin_role FROM public.profiles WHERE id = NEW.admin_id;
    IF admin_role != 'admin' THEN
      RAISE EXCEPTION 'Admin must have the admin role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;
