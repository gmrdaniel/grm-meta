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