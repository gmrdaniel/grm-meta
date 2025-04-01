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