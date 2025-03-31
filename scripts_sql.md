
# SQL Scripts in the Project

This document contains all the SQL scripts used in this project for database setup and migrations.

## Table Definitions

These SQL scripts define the tables in the database:

```sql
-- Table: creator_inventory
CREATE TABLE public.creator_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  correo character varying NOT NULL,
  telefono character varying,
  lada_telefono character varying,
  usuario_tiktok character varying,
  usuario_pinterest character varying,
  page_facebook character varying,
  estatus character varying DEFAULT 'activo'::character varying,
  fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.creator_inventory
  ADD CONSTRAINT creator_inventory_pkey PRIMARY KEY (id);

-- Table: notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'unread'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);

-- Table: profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  first_name text,
  last_name text,
  role user_role NOT NULL,
  profile_photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Table: project_stages
CREATE TABLE public.project_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project_id uuid NOT NULL,
  order_index integer NOT NULL,
  responsible text NOT NULL,
  url text NOT NULL,
  view text NOT NULL,
  response_positive text,
  response_negative text,
  slug text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_stages
  ADD CONSTRAINT project_stages_pkey PRIMARY KEY (id);

ALTER TABLE public.project_stages
  ADD CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);

-- Table: projects
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.projects
  ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
```

## Row Level Security Policies

```sql
-- RLS Policies for creator_inventory
ALTER TABLE public.creator_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" 
ON public.creator_inventory
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow read for anonymous users" 
ON public.creator_inventory
FOR SELECT 
TO anon
USING (true);
```

## Database Functions

```sql
-- Function: handle_new_user
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
$function$;

-- Function: get_table_definition
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
$function$;

-- Function: update_stages_order
CREATE OR REPLACE FUNCTION public.update_stages_order(stages_data json[])
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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
$function$;

-- Function: find_invitation_by_code
CREATE OR REPLACE FUNCTION public.find_invitation_by_code(code_param TEXT)
RETURNS SETOF creator_invitations AS $$
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
$$ LANGUAGE plpgsql;
```

## Triggers

```sql
-- Trigger: on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Enum Types

```sql
-- Enum Type: user_role
CREATE TYPE user_role AS ENUM ('admin', 'creator');
```
