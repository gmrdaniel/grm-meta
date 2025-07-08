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
    throw new Error(`No profile found for: ${email}`);
  }

  const currentTimestamp = new Date().toISOString();
  
  // Preparar todas las operaciones para ejecutarlas en paralelo
  const operations = [
    // 2. Crear o actualizar relación en profile_projects
    supabase.from("profile_projects").upsert(
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
    ),
    
    // 3. Actualizar el estatus de la invitación en creator_invitations
    supabase
      .from("creator_invitations")
      .update({ 
        status: status, // Mismo status del Excel
        updated_at: currentTimestamp
      })
      .eq("email", email)
      .eq("project_id", projectId),
      
    // 4. Buscar stages relacionados con el proyecto 
    supabase
      .from("project_stages")
      .select("id")
      .eq("project_id", projectId)
  ];
  
  // Ejecutar todas las operaciones en paralelo
  const [profileProjectResult, invitationUpdateResult, stagesResult] = await Promise.allSettled(operations);
  
  // Manejar resultado de profile_projects
  if (profileProjectResult.status === 'rejected' || (profileProjectResult.status === 'fulfilled' && profileProjectResult.value.error)) {
    const error = profileProjectResult.status === 'rejected' ? profileProjectResult.reason : profileProjectResult.value.error;
    throw error;
  }
  
  // Manejar resultado de actualización de invitación
  if (invitationUpdateResult.status === 'fulfilled' && invitationUpdateResult.value.error) {
    console.warn(`⚠️ Error al actualizar invitación para ${email}:`, invitationUpdateResult.value.error);
    // No lanzamos error aquí porque la relación ya se creó exitosamente
  } else if (invitationUpdateResult.status === 'fulfilled') {
    console.log(`✅ Invitación actualizada a "${status}" para: ${email}`);
  }
  
  // Manejar resultado de búsqueda de stages
  if (stagesResult.status === 'fulfilled' && !stagesResult.value.error && stagesResult.value.data && stagesResult.value.data.length > 0) {
    // Obtener los IDs de los stages
    const stageIds = stagesResult.value.data.map(stage => stage.id);
    
    try {
      // Buscar la notificación y obtener el ID de invitación en paralelo
      const [noticeTemplateResult, invitationIdResult] = await Promise.allSettled([
        supabase
          .from("notification_settings")
          .select("id, subject, message, template_id")
          .eq("type", "notice")
          .eq("target_status", status)
          .in("stage_id", stageIds) // Usar stage_id en lugar de invitation_event_id
          .maybeSingle(),
          
        supabase
          .from("creator_invitations")
          .select("id")
          .eq("email", email)
          .eq("project_id", projectId)
          .single()
      ]);
      
      // Procesar resultado de notificación
      if (noticeTemplateResult.status === 'fulfilled' && !noticeTemplateResult.value.error && noticeTemplateResult.value.data) {
        const noticeTemplate = noticeTemplateResult.value.data;
        let finalHtml = noticeTemplate.message;
        
        // Si hay un template_id asociado, obtener la plantilla HTML
        if (noticeTemplate.template_id) {
          const { data: templateData, error: templateErr } = await supabase
            .from("email_templates")
            .select("html")
            .eq("id", noticeTemplate.template_id)
            .single();

          if (!templateErr && templateData) {
            finalHtml = templateData.html.replace("{{content}}", noticeTemplate.message);
          }
        }
        
        // Enviar la notificación por Mailjet
        const { data: mailjetData, error: mailjetErr } = await supabase.functions.invoke("mailjet", {
          body: {
            email: email,
            subject: noticeTemplate.subject,
            html: finalHtml,
            variables: {}
          },
        });
        
        // Obtener el ID de invitación del resultado paralelo
        let invitationId = null;
        if (invitationIdResult.status === 'fulfilled' && !invitationIdResult.value.error && invitationIdResult.value.data) {
          invitationId = invitationIdResult.value.data.id;
        }
        
        if (mailjetErr) {
          console.error(`❌ Error al enviar notificación de ${status}:`, mailjetErr);
        } else {
          console.log(`✅ Notificación de ${status} enviada a: ${email}`);
          
          // Registrar en notification_logs si tenemos el ID de invitación
          if (invitationId) {
            const { error: logErr } = await supabase
              .from("notification_logs")
              .insert({
                invitation_id: invitationId,
                notification_setting_id: noticeTemplate.id,
                channel: "email",
                status: mailjetErr ? "failed" : "sent",
                error_message: mailjetErr ? `${noticeTemplate.subject}: ${mailjetErr.message}` : noticeTemplate.subject,
                sent_at: new Date().toISOString()
              });

            if (logErr) {
              console.warn(`⚠️ Error al registrar notificación en logs:`, logErr);
            }
          }
        }
      } else if (noticeTemplateResult.status === 'fulfilled' && noticeTemplateResult.value.error) {
        console.warn(`⚠️ No se encontró plantilla de notificación para ${status}:`, noticeTemplateResult.value.error);
      }
    } catch (error) {
      console.error(`❌ Error en el proceso de notificación de ${status}:`, error);
    }
  } else if (stagesResult.status === 'fulfilled' && stagesResult.value.error) {
    console.warn(`⚠️ No se encontraron stages para el proyecto ${projectId}:`, stagesResult.value.error);
  }
  
  console.log(
    `✅ Relación creada o actualizada: ${email} ↔ proyecto ${projectId} con status "${status}", page: ${fbProfileId}, owner: ${fbProfileOwnerId}`
  );
}