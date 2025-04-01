set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_validation_task_on_invitation_accept()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only proceed if the new status is 'accepted'
  IF NEW.status = 'accepted' THEN
    -- Insert new task
    INSERT INTO public.tasks (
      title, 
      project_id, 
      stage_id, 
      status, 
      creator_invitation_id
      -- creator_id removed as it's now optional
    )
    SELECT 
      'Validar registro',
      NEW.project_id,
      ps.id,
      'pending'::task_status,
      NEW.id
    FROM 
      public.project_stages ps
    WHERE 
      ps.view = 'meta/FbCreation'
      AND ps.project_id = NEW.project_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.find_invitation_by_code(code_param text)
 RETURNS SETOF creator_invitations
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Try exact match first
  RETURN QUERY 
  SELECT * FROM creator_invitations 
  WHERE invitation_code = code_param;
  
  -- If no rows returned, try case-insensitive match
  IF NOT FOUND THEN
    RETURN QUERY 
    SELECT * FROM creator_invitations 
    WHERE LOWER(invitation_code) = LOWER(code_param);
  END IF;
  
  -- If still no rows, try partial match
  IF NOT FOUND THEN
    RETURN QUERY 
    SELECT * FROM creator_invitations 
    WHERE invitation_code ILIKE '%' || code_param || '%';
  END IF;
  
  RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_creators_by_project_stage(project_id_param uuid, stage_id_param uuid)
 RETURNS TABLE(creator_id uuid, first_name text, last_name text, email text, task_count bigint, pending_count bigint, in_progress_count bigint, completed_count bigint, review_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS creator_id,
    p.first_name,
    p.last_name,
    p.email,
    COUNT(t.id) AS task_count,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_count,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS in_progress_count,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_count,
    COUNT(t.id) FILTER (WHERE t.status = 'review') AS review_count
  FROM 
    public.profiles p
    JOIN public.tasks t ON p.id = t.creator_id
  WHERE 
    t.project_id = project_id_param AND
    t.stage_id = stage_id_param AND
    p.role = 'creator'
  GROUP BY 
    p.id, p.first_name, p.last_name, p.email;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_creators_count_by_stage(project_id_param uuid)
 RETURNS TABLE(stage_id uuid, stage_name text, creators_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id AS stage_id,
    ps.name AS stage_name,
    COUNT(DISTINCT t.creator_id) AS creators_count
  FROM 
    public.project_stages ps
    LEFT JOIN public.tasks t ON ps.id = t.stage_id AND t.project_id = project_id_param
  WHERE 
    ps.project_id = project_id_param
  GROUP BY 
    ps.id, ps.name, ps.order_index
  ORDER BY 
    ps.order_index;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_definition(table_name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  result text;
BEGIN
  -- Get the CREATE TABLE statement
  WITH table_def AS (
    SELECT 
      'CREATE TABLE public.' || quote_ident(table_name) || ' (' AS create_stmt,
      string_agg(
        '  ' || quote_ident(column_name) || ' ' || 
        data_type || 
        CASE WHEN character_maximum_length IS NOT NULL 
             THEN '(' || character_maximum_length || ')' 
             ELSE '' 
        END || 
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL 
             THEN ' DEFAULT ' || column_default 
             ELSE '' 
        END,
        E',\n'
      ) AS columns_text
    FROM information_schema.columns
    WHERE table_name = $1 AND table_schema = 'public'
    GROUP BY table_name
  )
  SELECT create_stmt || E'\n' || columns_text || E'\n);' 
  INTO result
  FROM table_def;

  -- Add primary key constraints
  WITH pk_constraints AS (
    SELECT
      'ALTER TABLE public.' || quote_ident(tc.table_name) ||
      ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) || 
      ' PRIMARY KEY (' || string_agg(quote_ident(kcu.column_name), ', ') || ');' AS pk_stmt
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_name = $1
      AND tc.table_schema = 'public'
    GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
  )
  SELECT result || E'\n\n' || string_agg(pk_stmt, E'\n')
  INTO result
  FROM pk_constraints;

  -- Add foreign key constraints
  WITH fk_constraints AS (
    SELECT
      'ALTER TABLE public.' || quote_ident(tc.table_name) ||
      ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) || 
      ' FOREIGN KEY (' || string_agg(quote_ident(kcu.column_name), ', ') || ')' ||
      ' REFERENCES ' || quote_ident(ccu.table_schema) || '.' || quote_ident(ccu.table_name) ||
      ' (' || string_agg(quote_ident(ccu.column_name), ', ') || ');' AS fk_stmt
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = $1
      AND tc.table_schema = 'public'
    GROUP BY tc.table_schema, tc.table_name, tc.constraint_name, ccu.table_schema, ccu.table_name
  )
  SELECT result || E'\n\n' || string_agg(fk_stmt, E'\n')
  INTO result
  FROM fk_constraints;

  -- Add indexes (excluding those for primary keys and unique constraints)
  WITH indexes AS (
    SELECT
      'CREATE INDEX ' || quote_ident(i.indexname) || 
      ' ON public.' || quote_ident(i.tablename) || 
      ' USING ' || am.amname || ' (' || 
      string_agg(quote_ident(a.attname), ', ' ORDER BY x.indkey_subscript) || ');' AS idx_stmt
    FROM 
      pg_index AS ind
      JOIN pg_class AS t ON ind.indrelid = t.oid
      JOIN pg_namespace AS ns ON t.relnamespace = ns.oid
      JOIN pg_class AS i ON ind.indexrelid = i.oid
      JOIN pg_am AS am ON i.relam = am.oid
      JOIN (
        SELECT
          attrelid,
          attname,
          unnest(indkey) AS attnum,
          generate_subscripts(indkey, 1) AS indkey_subscript
        FROM
          pg_index
          JOIN pg_attribute ON attrelid = indrelid
      ) AS x ON x.attrelid = t.oid AND x.attnum = a.attnum
      JOIN pg_attribute AS a ON a.attrelid = t.oid
    WHERE
      ns.nspname = 'public'
      AND t.relname = $1
      AND NOT ind.indisprimary
      AND NOT ind.indisunique
      AND a.attnum > 0
    GROUP BY i.indexname, i.tablename, am.amname
  )
  SELECT result || E'\n\n' || string_agg(idx_stmt, E'\n')
  INTO result
  FROM indexes;

  -- Add RLS policies
  WITH rls_policies AS (
    SELECT
      'ALTER TABLE public.' || quote_ident($1) || ' ENABLE ROW LEVEL SECURITY;' || E'\n' ||
      string_agg(
        'CREATE POLICY ' || quote_ident(polname) || ' ON public.' || 
        quote_ident($1) || ' FOR ' || cmd || 
        CASE WHEN qual IS NOT NULL THEN ' USING (' || pg_get_expr(qual, polrelid) || ')' ELSE '' END ||
        CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || pg_get_expr(with_check, polrelid) || ')' ELSE '' END || 
        ';',
        E'\n'
      ) AS policy_stmts
    FROM pg_policy
    JOIN pg_class ON pg_policy.polrelid = pg_class.oid
    WHERE pg_class.relname = $1
    GROUP BY pg_class.relname
  )
  SELECT
    CASE WHEN exists(SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
                    WHERE c.relrowsecurity = true AND c.relname = $1 AND n.nspname = 'public')
         THEN result || E'\n\n' || policy_stmts
         ELSE result
    END
  INTO result
  FROM rls_policies;

  -- Add comments
  WITH comments AS (
    SELECT
      'COMMENT ON COLUMN public.' || quote_ident($1) || '.' || 
      quote_ident(a.attname) || ' IS ' || quote_literal(d.description) || ';' AS comment_stmt
    FROM 
      pg_description d
      JOIN pg_class c ON d.objoid = c.oid
      JOIN pg_attribute a ON c.oid = a.attrelid AND d.objsubid = a.attnum
      JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE 
      c.relname = $1
      AND n.nspname = 'public'
      AND d.objsubid <> 0
  )
  SELECT result || E'\n\n' || string_agg(comment_stmt, E'\n')
  INTO result
  FROM comments
  WHERE exists(SELECT 1 FROM comments);

  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tasks_count_by_stage(project_id_param uuid)
 RETURNS TABLE(stage_id uuid, stage_name text, tasks_count bigint, pending_count bigint, in_progress_count bigint, completed_count bigint, review_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id AS stage_id,
    ps.name AS stage_name,
    COUNT(t.id) AS tasks_count,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_count,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS in_progress_count,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_count,
    COUNT(t.id) FILTER (WHERE t.status = 'review') AS review_count
  FROM 
    public.project_stages ps
    LEFT JOIN public.tasks t ON ps.id = t.stage_id AND t.project_id = project_id_param
  WHERE 
    ps.project_id = project_id_param
  GROUP BY 
    ps.id, ps.name, ps.order_index
  ORDER BY 
    ps.order_index;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'creator');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_stage_in_project(stage_id uuid, project_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_stages ps
    WHERE ps.id = stage_id AND ps.project_id = project_id_param
  );
END;
$function$
;
