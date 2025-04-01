SET search_path TO public, auth, storage;

create type "public"."invitation_status" as enum ('pending', 'accepted', 'rejected', 'completed');

create type "public"."task_status" as enum ('pending', 'in_progress', 'completed', 'review');

create type "public"."user_role" as enum ('admin', 'creator');

create table "public"."bulk_creator_invitation_details" (
    "id" uuid not null default gen_random_uuid(),
    "bulk_invitation_id" uuid not null,
    "full_name" text not null,
    "email" text not null,
    "is_active" boolean not null default true,
    "status" text not null default 'pending'::text,
    "error_message" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."bulk_creator_invitation_details" enable row level security;

create table "public"."bulk_creator_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "file_name" text not null,
    "status" text not null default 'processing'::text,
    "total_rows" integer not null default 0,
    "processed_rows" integer not null default 0,
    "failed_rows" integer not null default 0,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."bulk_creator_invitations" enable row level security;

create table "public"."creator_inventory" (
    "id" uuid not null default gen_random_uuid(),
    "nombre" character varying(100) not null,
    "apellido" character varying(100) not null,
    "correo" character varying(150) not null,
    "usuario_tiktok" character varying(100),
    "usuario_pinterest" character varying(100),
    "page_facebook" character varying(150),
    "lada_telefono" character varying(10),
    "telefono" character varying(20),
    "estatus" character varying(50) default 'activo'::character varying,
    "fecha_creacion" timestamp with time zone default CURRENT_TIMESTAMP,
    "seguidores_tiktok" integer,
    "usuario_youtube" character varying,
    "seguidores_youtube" integer,
    "seguidores_pinterest" integer,
    "elegible_tiktok" boolean,
    "engagement_tiktok" numeric,
    "elegible_youtube" boolean,
    "engagement_youtube" numeric,
    "secuid_tiktok" character varying
);


alter table "public"."creator_inventory" enable row level security;

create table "public"."creator_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" text not null,
    "email" text not null,
    "social_media_handle" text,
    "social_media_type" text,
    "project_id" uuid,
    "invitation_type" text not null,
    "invitation_url" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "invitation_code" text not null,
    "youtube_channel" text,
    "instagram_user" text,
    "phone_country_code" text,
    "phone_number" text,
    "phone_verified" boolean default false,
    "facebook_page" text,
    "status" invitation_status not null default 'pending'::invitation_status,
    "current_stage_id" uuid
);


alter table "public"."creator_invitations" enable row level security;

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "profile_id" uuid not null,
    "type" text not null,
    "message" text not null,
    "status" text not null default 'unread'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."notifications" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "role" user_role not null,
    "email" text,
    "first_name" text,
    "last_name" text,
    "profile_photo_url" text
);


alter table "public"."profiles" enable row level security;

create table "public"."project_stages" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "name" text not null,
    "slug" text not null,
    "url" text not null,
    "view" text not null,
    "responsible" text not null,
    "response_positive" text,
    "response_negative" text,
    "order_index" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "privacy" text not null default 'private'::text
);


alter table "public"."project_stages" enable row level security;

create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "status" text not null default 'draft'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."projects" enable row level security;

create table "public"."tasks" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "project_id" uuid not null,
    "stage_id" uuid not null,
    "creator_id" uuid,
    "admin_id" uuid,
    "status" task_status not null default 'pending'::task_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "creator_invitation_id" uuid
);


alter table "public"."tasks" enable row level security;

create table "public"."tiktok_video" (
    "id" uuid not null default gen_random_uuid(),
    "creator_id" uuid not null,
    "video_id" text not null,
    "description" text,
    "create_time" bigint,
    "author" text,
    "author_id" text,
    "video_definition" text,
    "duration" integer,
    "number_of_comments" integer,
    "number_of_hearts" bigint,
    "number_of_plays" bigint,
    "number_of_reposts" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tiktok_video" enable row level security;

CREATE UNIQUE INDEX bulk_creator_invitation_details_pkey ON public.bulk_creator_invitation_details USING btree (id);

CREATE UNIQUE INDEX bulk_creator_invitations_pkey ON public.bulk_creator_invitations USING btree (id);

CREATE INDEX creator_invitations_email_idx ON public.creator_invitations USING btree (email);

CREATE UNIQUE INDEX creator_invitations_email_unique ON public.creator_invitations USING btree (email);

CREATE UNIQUE INDEX creator_invitations_pkey ON public.creator_invitations USING btree (id);

CREATE INDEX creator_invitations_project_id_idx ON public.creator_invitations USING btree (project_id);

CREATE INDEX idx_tasks_admin_id ON public.tasks USING btree (admin_id);

CREATE INDEX idx_tasks_creator_id ON public.tasks USING btree (creator_id);

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);

CREATE INDEX idx_tasks_stage_id ON public.tasks USING btree (stage_id);

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);

CREATE INDEX idx_tiktok_video_creator_id ON public.tiktok_video USING btree (creator_id);

CREATE UNIQUE INDEX idx_tiktok_video_video_id ON public.tiktok_video USING btree (video_id);

CREATE UNIQUE INDEX inventario_creadores_correo_key ON public.creator_inventory USING btree (correo);

CREATE UNIQUE INDEX inventario_creadores_pkey ON public.creator_inventory USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX project_stages_pkey ON public.project_stages USING btree (id);

CREATE UNIQUE INDEX project_stages_project_id_slug_key ON public.project_stages USING btree (project_id, slug);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE UNIQUE INDEX tiktok_video_pkey ON public.tiktok_video USING btree (id);

alter table "public"."bulk_creator_invitation_details" add constraint "bulk_creator_invitation_details_pkey" PRIMARY KEY using index "bulk_creator_invitation_details_pkey";

alter table "public"."bulk_creator_invitations" add constraint "bulk_creator_invitations_pkey" PRIMARY KEY using index "bulk_creator_invitations_pkey";

alter table "public"."creator_inventory" add constraint "inventario_creadores_pkey" PRIMARY KEY using index "inventario_creadores_pkey";

alter table "public"."creator_invitations" add constraint "creator_invitations_pkey" PRIMARY KEY using index "creator_invitations_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."project_stages" add constraint "project_stages_pkey" PRIMARY KEY using index "project_stages_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."tiktok_video" add constraint "tiktok_video_pkey" PRIMARY KEY using index "tiktok_video_pkey";

alter table "public"."bulk_creator_invitation_details" add constraint "bulk_creator_invitation_details_bulk_invitation_id_fkey" FOREIGN KEY (bulk_invitation_id) REFERENCES bulk_creator_invitations(id) not valid;

alter table "public"."bulk_creator_invitation_details" validate constraint "bulk_creator_invitation_details_bulk_invitation_id_fkey";

alter table "public"."bulk_creator_invitations" add constraint "bulk_creator_invitations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."bulk_creator_invitations" validate constraint "bulk_creator_invitations_created_by_fkey";

alter table "public"."creator_inventory" add constraint "inventario_creadores_correo_key" UNIQUE using index "inventario_creadores_correo_key";

alter table "public"."creator_invitations" add constraint "check_stage_belongs_to_project" CHECK (((current_stage_id IS NULL) OR is_stage_in_project(current_stage_id, project_id))) not valid;

alter table "public"."creator_invitations" validate constraint "check_stage_belongs_to_project";

alter table "public"."creator_invitations" add constraint "creator_invitations_current_stage_id_fkey" FOREIGN KEY (current_stage_id) REFERENCES project_stages(id) not valid;

alter table "public"."creator_invitations" validate constraint "creator_invitations_current_stage_id_fkey";

alter table "public"."creator_invitations" add constraint "creator_invitations_email_unique" UNIQUE using index "creator_invitations_email_unique";

alter table "public"."creator_invitations" add constraint "creator_invitations_invitation_type_check" CHECK ((invitation_type = ANY (ARRAY['new_user'::text, 'existing_user'::text]))) not valid;

alter table "public"."creator_invitations" validate constraint "creator_invitations_invitation_type_check";

alter table "public"."creator_invitations" add constraint "creator_invitations_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."creator_invitations" validate constraint "creator_invitations_project_id_fkey";

alter table "public"."creator_invitations" add constraint "creator_invitations_social_media_type_check" CHECK ((social_media_type = ANY (ARRAY['tiktok'::text, 'pinterest'::text]))) not valid;

alter table "public"."creator_invitations" validate constraint "creator_invitations_social_media_type_check";

alter table "public"."notifications" add constraint "notifications_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) not valid;

alter table "public"."notifications" validate constraint "notifications_profile_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."project_stages" add constraint "project_stages_privacy_check" CHECK ((privacy = ANY (ARRAY['public'::text, 'private'::text]))) not valid;

alter table "public"."project_stages" validate constraint "project_stages_privacy_check";

alter table "public"."project_stages" add constraint "project_stages_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_stages" validate constraint "project_stages_project_id_fkey";

alter table "public"."project_stages" add constraint "project_stages_project_id_slug_key" UNIQUE using index "project_stages_project_id_slug_key";

alter table "public"."tasks" add constraint "tasks_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_admin_id_fkey";

alter table "public"."tasks" add constraint "tasks_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_creator_id_fkey";

alter table "public"."tasks" add constraint "tasks_creator_invitation_id_fkey" FOREIGN KEY (creator_invitation_id) REFERENCES creator_invitations(id) not valid;

alter table "public"."tasks" validate constraint "tasks_creator_invitation_id_fkey";

alter table "public"."tasks" add constraint "tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_project_id_fkey";

alter table "public"."tasks" add constraint "tasks_stage_id_fkey" FOREIGN KEY (stage_id) REFERENCES project_stages(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_stage_id_fkey";

alter table "public"."tiktok_video" add constraint "tiktok_video_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES creator_inventory(id) ON DELETE CASCADE not valid;

alter table "public"."tiktok_video" validate constraint "tiktok_video_creator_id_fkey";

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

create or replace view "public"."summary_creator" as  SELECT ci.nombre,
    ci.apellido,
    ci.correo,
    ci.usuario_tiktok,
    ci.seguidores_tiktok,
    COALESCE((sum(((tv.number_of_comments + tv.number_of_hearts) + tv.number_of_reposts)) / (NULLIF(ci.seguidores_tiktok, 0))::numeric), (0)::numeric) AS engagement,
    COALESCE(avg(tv.duration), (0)::numeric) AS duration_average,
    max(tv.create_time) AS date_last_post
   FROM (creator_inventory ci
     LEFT JOIN tiktok_video tv ON ((ci.id = tv.creator_id)))
  GROUP BY ci.id, ci.nombre, ci.apellido, ci.correo, ci.usuario_tiktok, ci.seguidores_tiktok;


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

grant delete on table "public"."bulk_creator_invitation_details" to "anon";

grant insert on table "public"."bulk_creator_invitation_details" to "anon";

grant references on table "public"."bulk_creator_invitation_details" to "anon";

grant select on table "public"."bulk_creator_invitation_details" to "anon";

grant trigger on table "public"."bulk_creator_invitation_details" to "anon";

grant truncate on table "public"."bulk_creator_invitation_details" to "anon";

grant update on table "public"."bulk_creator_invitation_details" to "anon";

grant delete on table "public"."bulk_creator_invitation_details" to "authenticated";

grant insert on table "public"."bulk_creator_invitation_details" to "authenticated";

grant references on table "public"."bulk_creator_invitation_details" to "authenticated";

grant select on table "public"."bulk_creator_invitation_details" to "authenticated";

grant trigger on table "public"."bulk_creator_invitation_details" to "authenticated";

grant truncate on table "public"."bulk_creator_invitation_details" to "authenticated";

grant update on table "public"."bulk_creator_invitation_details" to "authenticated";

grant delete on table "public"."bulk_creator_invitation_details" to "service_role";

grant insert on table "public"."bulk_creator_invitation_details" to "service_role";

grant references on table "public"."bulk_creator_invitation_details" to "service_role";

grant select on table "public"."bulk_creator_invitation_details" to "service_role";

grant trigger on table "public"."bulk_creator_invitation_details" to "service_role";

grant truncate on table "public"."bulk_creator_invitation_details" to "service_role";

grant update on table "public"."bulk_creator_invitation_details" to "service_role";

grant delete on table "public"."bulk_creator_invitations" to "anon";

grant insert on table "public"."bulk_creator_invitations" to "anon";

grant references on table "public"."bulk_creator_invitations" to "anon";

grant select on table "public"."bulk_creator_invitations" to "anon";

grant trigger on table "public"."bulk_creator_invitations" to "anon";

grant truncate on table "public"."bulk_creator_invitations" to "anon";

grant update on table "public"."bulk_creator_invitations" to "anon";

grant delete on table "public"."bulk_creator_invitations" to "authenticated";

grant insert on table "public"."bulk_creator_invitations" to "authenticated";

grant references on table "public"."bulk_creator_invitations" to "authenticated";

grant select on table "public"."bulk_creator_invitations" to "authenticated";

grant trigger on table "public"."bulk_creator_invitations" to "authenticated";

grant truncate on table "public"."bulk_creator_invitations" to "authenticated";

grant update on table "public"."bulk_creator_invitations" to "authenticated";

grant delete on table "public"."bulk_creator_invitations" to "service_role";

grant insert on table "public"."bulk_creator_invitations" to "service_role";

grant references on table "public"."bulk_creator_invitations" to "service_role";

grant select on table "public"."bulk_creator_invitations" to "service_role";

grant trigger on table "public"."bulk_creator_invitations" to "service_role";

grant truncate on table "public"."bulk_creator_invitations" to "service_role";

grant update on table "public"."bulk_creator_invitations" to "service_role";

grant delete on table "public"."creator_inventory" to "anon";

grant insert on table "public"."creator_inventory" to "anon";

grant references on table "public"."creator_inventory" to "anon";

grant select on table "public"."creator_inventory" to "anon";

grant trigger on table "public"."creator_inventory" to "anon";

grant truncate on table "public"."creator_inventory" to "anon";

grant update on table "public"."creator_inventory" to "anon";

grant delete on table "public"."creator_inventory" to "authenticated";

grant insert on table "public"."creator_inventory" to "authenticated";

grant references on table "public"."creator_inventory" to "authenticated";

grant select on table "public"."creator_inventory" to "authenticated";

grant trigger on table "public"."creator_inventory" to "authenticated";

grant truncate on table "public"."creator_inventory" to "authenticated";

grant update on table "public"."creator_inventory" to "authenticated";

grant delete on table "public"."creator_inventory" to "service_role";

grant insert on table "public"."creator_inventory" to "service_role";

grant references on table "public"."creator_inventory" to "service_role";

grant select on table "public"."creator_inventory" to "service_role";

grant trigger on table "public"."creator_inventory" to "service_role";

grant truncate on table "public"."creator_inventory" to "service_role";

grant update on table "public"."creator_inventory" to "service_role";

grant delete on table "public"."creator_invitations" to "anon";

grant insert on table "public"."creator_invitations" to "anon";

grant references on table "public"."creator_invitations" to "anon";

grant select on table "public"."creator_invitations" to "anon";

grant trigger on table "public"."creator_invitations" to "anon";

grant truncate on table "public"."creator_invitations" to "anon";

grant update on table "public"."creator_invitations" to "anon";

grant delete on table "public"."creator_invitations" to "authenticated";

grant insert on table "public"."creator_invitations" to "authenticated";

grant references on table "public"."creator_invitations" to "authenticated";

grant select on table "public"."creator_invitations" to "authenticated";

grant trigger on table "public"."creator_invitations" to "authenticated";

grant truncate on table "public"."creator_invitations" to "authenticated";

grant update on table "public"."creator_invitations" to "authenticated";

grant delete on table "public"."creator_invitations" to "service_role";

grant insert on table "public"."creator_invitations" to "service_role";

grant references on table "public"."creator_invitations" to "service_role";

grant select on table "public"."creator_invitations" to "service_role";

grant trigger on table "public"."creator_invitations" to "service_role";

grant truncate on table "public"."creator_invitations" to "service_role";

grant update on table "public"."creator_invitations" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."project_stages" to "anon";

grant insert on table "public"."project_stages" to "anon";

grant references on table "public"."project_stages" to "anon";

grant select on table "public"."project_stages" to "anon";

grant trigger on table "public"."project_stages" to "anon";

grant truncate on table "public"."project_stages" to "anon";

grant update on table "public"."project_stages" to "anon";

grant delete on table "public"."project_stages" to "authenticated";

grant insert on table "public"."project_stages" to "authenticated";

grant references on table "public"."project_stages" to "authenticated";

grant select on table "public"."project_stages" to "authenticated";

grant trigger on table "public"."project_stages" to "authenticated";

grant truncate on table "public"."project_stages" to "authenticated";

grant update on table "public"."project_stages" to "authenticated";

grant delete on table "public"."project_stages" to "service_role";

grant insert on table "public"."project_stages" to "service_role";

grant references on table "public"."project_stages" to "service_role";

grant select on table "public"."project_stages" to "service_role";

grant trigger on table "public"."project_stages" to "service_role";

grant truncate on table "public"."project_stages" to "service_role";

grant update on table "public"."project_stages" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."tasks" to "anon";

grant insert on table "public"."tasks" to "anon";

grant references on table "public"."tasks" to "anon";

grant select on table "public"."tasks" to "anon";

grant trigger on table "public"."tasks" to "anon";

grant truncate on table "public"."tasks" to "anon";

grant update on table "public"."tasks" to "anon";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."tiktok_video" to "anon";

grant insert on table "public"."tiktok_video" to "anon";

grant references on table "public"."tiktok_video" to "anon";

grant select on table "public"."tiktok_video" to "anon";

grant trigger on table "public"."tiktok_video" to "anon";

grant truncate on table "public"."tiktok_video" to "anon";

grant update on table "public"."tiktok_video" to "anon";

grant delete on table "public"."tiktok_video" to "authenticated";

grant insert on table "public"."tiktok_video" to "authenticated";

grant references on table "public"."tiktok_video" to "authenticated";

grant select on table "public"."tiktok_video" to "authenticated";

grant trigger on table "public"."tiktok_video" to "authenticated";

grant truncate on table "public"."tiktok_video" to "authenticated";

grant update on table "public"."tiktok_video" to "authenticated";

grant delete on table "public"."tiktok_video" to "service_role";

grant insert on table "public"."tiktok_video" to "service_role";

grant references on table "public"."tiktok_video" to "service_role";

grant select on table "public"."tiktok_video" to "service_role";

grant trigger on table "public"."tiktok_video" to "service_role";

grant truncate on table "public"."tiktok_video" to "service_role";

grant update on table "public"."tiktok_video" to "service_role";

create policy "Users can insert bulk invitation details"
on "public"."bulk_creator_invitation_details"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Users can view bulk invitation details"
on "public"."bulk_creator_invitation_details"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Users can insert bulk invitations"
on "public"."bulk_creator_invitations"
as permissive
for insert
to public
with check ((auth.uid() = created_by));


create policy "Users can update bulk invitations"
on "public"."bulk_creator_invitations"
as permissive
for update
to public
using ((auth.uid() = created_by));


create policy "Users can view bulk invitations"
on "public"."bulk_creator_invitations"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Allow admins full access to inventory creators"
on "public"."creator_inventory"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'admin'::text))
with check (((auth.jwt() ->> 'role'::text) = 'admin'::text));


create policy "Allow all operations for authenticated users"
on "public"."creator_inventory"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Allow read for anonymous users"
on "public"."creator_inventory"
as permissive
for select
to anon
using (true);


create policy "Admins can manage all invitations"
on "public"."creator_invitations"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));


create policy "Allow anonymous updates"
on "public"."creator_invitations"
as permissive
for update
to anon
using (true)
with check (true);


create policy "Allow anonymous users to read invitations"
on "public"."creator_invitations"
as permissive
for select
to anon
using (true);


create policy "Allow anyone to read invitations"
on "public"."creator_invitations"
as permissive
for select
to anon, authenticated
using (true);


create policy "Allow authenticated inserts only"
on "public"."creator_invitations"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow public insert access to creator_invitations"
on "public"."creator_invitations"
as permissive
for insert
to anon
with check (true);


create policy "Allow public read access to creator_invitations"
on "public"."creator_invitations"
as permissive
for select
to anon
using (true);


create policy "Users can update their own notifications"
on "public"."notifications"
as permissive
for update
to public
using ((auth.uid() = profile_id));


create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to public
using ((auth.uid() = profile_id));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Admins can manage project stages"
on "public"."project_stages"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));


create policy "Enable read access for all users"
on "public"."project_stages"
as permissive
for select
to public
using (true);


create policy "Admins can manage projects"
on "public"."projects"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));


create policy "Admins can delete tasks"
on "public"."tasks"
as permissive
for delete
to public
using ((get_user_role(auth.uid()) = 'admin'::text));


create policy "Admins can insert tasks"
on "public"."tasks"
as permissive
for insert
to public
with check ((get_user_role(auth.uid()) = 'admin'::text));


create policy "Admins can update all tasks"
on "public"."tasks"
as permissive
for update
to public
using ((get_user_role(auth.uid()) = 'admin'::text));


create policy "Admins can view all tasks"
on "public"."tasks"
as permissive
for select
to public
using ((get_user_role(auth.uid()) = 'admin'::text));


create policy "Creators can update their own tasks"
on "public"."tasks"
as permissive
for update
to public
using ((creator_id = auth.uid()));


create policy "Creators can view their own tasks"
on "public"."tasks"
as permissive
for select
to public
using ((creator_id = auth.uid()));


create policy "Allow all authenticated users to view videos"
on "public"."tiktok_video"
as permissive
for select
to authenticated
using (true);


create policy "Allow authenticated users to manage videos"
on "public"."tiktok_video"
as permissive
for all
to authenticated
using (true);


CREATE TRIGGER create_validation_task_on_invitation_accept_trigger AFTER UPDATE ON public.creator_invitations FOR EACH ROW EXECUTE FUNCTION create_validation_task_on_invitation_accept();

CREATE TRIGGER create_validation_task_on_invitation_insert_trigger AFTER INSERT ON public.creator_invitations FOR EACH ROW WHEN ((new.status = 'accepted'::invitation_status)) EXECUTE FUNCTION create_validation_task_on_invitation_accept();

CREATE TRIGGER validate_task_roles_trigger BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION validate_task_roles();


