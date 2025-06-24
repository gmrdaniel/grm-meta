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

