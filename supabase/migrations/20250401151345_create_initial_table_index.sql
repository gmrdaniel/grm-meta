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
