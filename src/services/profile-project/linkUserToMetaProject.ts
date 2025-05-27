import { supabase } from "@/integrations/supabase/client";

interface LinkProfileParams {
  email: string;
  projectId: string;
  adminId: string;
  status?: "approved" | "rejected";
  fb_profile_id: string;
  fb_profile_owner_id: string;
}

export async function linkProfileToProjectById({
  email,
  projectId,
  adminId,
  status = "approved",
  fb_profile_id,
  fb_profile_owner_id,
}: LinkProfileParams) {
  // 1. Buscar perfil con rol 'creator'
  const { data: profileData, error: profileErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .eq("role", "creator")
    .single();

  if (profileErr || !profileData) {
    throw new Error(`No se encontró perfil para: ${email}`);
  }

  // 2. Crear o actualizar relación en profile_projects
  const { error: insertErr } = await supabase.from("profile_projects").upsert(
    {
      id: crypto.randomUUID(),
      profile_id: profileData.id,
      project_id: projectId,
      admin_id: adminId,
      status,
      fb_profile_id,
      fb_profile_owner_id,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "profile_id,project_id",
    }
  );

  if (insertErr) {
    throw insertErr;
  }

  console.log(
    `✅ Relación creada o actualizada: ${email} ↔ proyecto ${projectId} con status "${status}", page: ${fb_profile_id}, owner: ${fb_profile_owner_id}`
  );
}
