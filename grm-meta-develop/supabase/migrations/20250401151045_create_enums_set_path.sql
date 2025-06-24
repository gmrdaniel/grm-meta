SET search_path TO public, auth, storage;

create type "public"."invitation_status" as enum ('pending', 'accepted', 'rejected', 'completed');

create type "public"."task_status" as enum ('pending', 'in_progress', 'completed', 'review');

create type "public"."user_role" as enum ('admin', 'creator');