import { supabase } from "@/integrations/supabase/client";
interface LinkProfileParams {
  email: string;
  projectId: string;
  adminId: string;
  status?: "approved" | "rejected";
  fbProfileId: string;
  fbProfileOwnerId: string;
  approvalDate?: string;
}

export async function linkProfileToProjectById({
  email,
  projectId,
  adminId,
  status = "approved",
  fbProfileId,
  fbProfileOwnerId,
  approvalDate
}: LinkProfileParams) {
  // 1. Buscar perfil con rol 'creator'
  console.log('DataTransfer',email, projectId, adminId, status, fbProfileId, fbProfileOwnerId, approvalDate);
  
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
  const currentTimestamp = new Date().toISOString();
  
  const { error: insertErr } = await supabase.from("profile_projects").upsert(
    {
      id: crypto.randomUUID(), // Generar ID para registros nuevos
      profile_id: profileData.id,
      project_id: projectId,
      admin_id: adminId,
      status,
      fb_profile_id: fbProfileId,
      fb_profile_owner_id: fbProfileOwnerId,
      joined_at: approvalDate || currentTimestamp, // Usar approvalDate si se proporciona, o el timestamp actual
      updated_at: currentTimestamp,
    },
    {
      onConflict: "profile_id,project_id",
      ignoreDuplicates: false, // Asegura que se actualice si ya existe (incluyendo el status)
    }
  );

  if (insertErr) {
    throw insertErr;
  }

  // 3. Actualizar el estatus de la invitación en creator_invitations
  // El status de la invitación es igual al status del import (approved o rejected)
  const { error: invitationUpdateErr } = await supabase
    .from("creator_invitations")
    .update({ 
      status: status, // Mismo status del Excel
      updated_at: currentTimestamp
    })
    .eq("email", email)
    .eq("project_id", projectId);

  if (invitationUpdateErr) {
    console.warn(`⚠️ Error al actualizar invitación para ${email}:`, invitationUpdateErr);
    // No lanzamos error aquí porque la relación ya se creó exitosamente
  } else {
    console.log(`✅ Invitación actualizada a "${status}" para: ${email}`);
  }

  console.log(
    `✅ Relación creada o actualizada: ${email} ↔ proyecto ${projectId} con status "${status}", page: ${fbProfileId}, owner: ${fbProfileOwnerId}`
  );
}