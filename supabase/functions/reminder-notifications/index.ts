// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Inicializa Supabase y variables de entorno
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const apiKey = Deno.env.get("MAILJET_API_KEY");
const apiSecret = Deno.env.get("MAILJET_API_SECRET");
const senderEmail = Deno.env.get("MAILJET_SENDER_EMAIL");
const baseAppUrl = Deno.env.get("BASE_APP_URL");

const MAX_BATCH = 100; // máximo por ejecución

serve(async (req) => {
  console.log("Iniciando procesamiento de notificaciones de recordatorio");
  let totalEnviados = 0;

  try {
    // Obtener parámetros de la solicitud
    const params = await req.json().catch(() => ({}));
    const settingId = params.settingId; // ID de configuración específica (opcional)

    // 1. Obtener todas las configuraciones de notificaciones de tipo 'reminder' habilitadas
    let query = supabase
      .from("notification_settings")
      .select("*")
      .eq("enabled", true)
      .eq("type", "reminder"); 
      //.not("campaign_id", "is", null)
    
    // Si se especifica un ID de configuración, filtrar solo por esa
    if (settingId) {
      query = query.eq("id", settingId);
    }

    const { data: reminderSettings, error: settingsError } = await query;

    if (settingsError) {
      console.error("Error al obtener configuraciones de recordatorio:", settingsError);
      return new Response("Error al obtener configuraciones", { status: 500 });
    }

    console.log(`Encontradas ${reminderSettings?.length || 0} configuraciones de recordatorio activas`);

    // 2. Procesar cada configuración de recordatorio
    for (const setting of reminderSettings || []) {
      const { invitation_event_id, campaign_id, sequence_order, id: settingId } = setting;
      
      console.log(`Procesando configuración ID: ${settingId}, sequence_order: ${sequence_order || 'null'}, evento: ${invitation_event_id}`);
      
      if (!invitation_event_id) {
        console.log(`Omitiendo configuración ${setting.id}: No tiene invitation_event_id`);
        continue;
      }

      // 3. Obtener creadores elegibles para esta notificación
      const { data: creators, error: creatorsError } = await supabase
        .from("creator_invitations_events")
        .select(`
          id,
          creator_invitation_id,
          creator_invitations:creator_invitation_id (
            id,
            first_name,
            last_name,
            email,
            invitation_url,
            status
          )
        `)
        .eq("invitation_event_id", invitation_event_id);

      if (creatorsError) {
        console.error(`Error al obtener creadores para el evento ${invitation_event_id}:`, creatorsError);
        continue;
      }

      // Filtrar por target_status si está configurado
      let filteredCreators = creators || [];
      if (setting.target_status) {
        console.log(`Filtrando por target_status: ${setting.target_status}`);
        filteredCreators = filteredCreators.filter(entry => 
          entry.creator_invitations.status === setting.target_status
        );
      }

      // Si hay campaign_id y email_status, verificar el estado real del email con Mailjet
      if (campaign_id && setting.email_status) {
        console.log(`Verificando email_status con Mailjet para campaña ${campaign_id}`);
        try {
          // Obtener estadísticas de la campaña desde Mailjet
          const { data: campaignStats, error: statsError } = await supabase.functions.invoke('mailjet-single-campaign-stats', {
            body: { campaignId: campaign_id }
          });

          if (statsError) throw statsError;

          // Mapear los mensajes por email para facilitar la búsqueda
          const messagesByEmail = {};
          campaignStats.campaign.messages.forEach(message => {
            messagesByEmail[message.ContactAlt] = message.Status;
          });

          // Filtrar creadores según el estado del email
          filteredCreators = filteredCreators.filter(entry => {
            const email = entry.creator_invitations.email;
            const emailStatus = messagesByEmail[email];
            
            console.log(`Email ${email}: Estado Mailjet=${emailStatus}, Requerido=${setting.email_status}`);
            return emailStatus === setting.email_status;
          });
        } catch (error) {
          console.error(`Error al obtener estadísticas de Mailjet:`, error);
          // Continuar con los creadores sin filtrar por email_status
        }
      }

      const eligibleCreators = filteredCreators;

      console.log(`Encontrados ${eligibleCreators?.length || 0} creadores elegibles para el evento ${invitation_event_id}`);

      if (!eligibleCreators?.length) continue;

      // 4. Filtrar creadores según la lógica de sequence_order - Usando Promise.allSettled con procesamiento por lotes
      const BATCH_SIZE = 50; // Ajusta este número según sea necesario
      let allCreatorsToNotify = [];
      
      // Procesar creadores en lotes
      for (let i = 0; i < eligibleCreators.length; i += BATCH_SIZE) {
        const batch = eligibleCreators.slice(i, i + BATCH_SIZE);
        console.log(`Procesando lote ${Math.floor(i/BATCH_SIZE) + 1} de ${Math.ceil(eligibleCreators.length/BATCH_SIZE)} (${batch.length} creadores)`);
        
        const batchPromises = batch.map(async (entry) => {
          const creator = entry.creator_invitations;
          
          console.log(`Evaluando creador ID: ${creator.id}, email: ${creator.email}`);
          
          // Obtener historial de notificaciones enviadas para este creador y evento
          const { data: notificationLogs } = await supabase
            .from("notification_logs")
            .select(`
              id,
              notification_setting_id,
              sent_at,
              notification_settings:notification_setting_id(
                id,
                sequence_order,
                invitation_event_id
              )
            `)
            .eq("invitation_id", creator.id)
            .eq("status", "sent")
            .eq("channel", "email")
            .order("notification_settings(sequence_order)", { ascending: true })
            .order("sent_at", { ascending: false });
          
          // Filtrar solo las notificaciones del evento actual
          const eventNotifications = (notificationLogs || []).filter(log => 
            log.notification_settings?.invitation_event_id === invitation_event_id
          );
          
          console.log(`Notificaciones previas para creador ${creator.id}: ${eventNotifications.length}`);
          
          // Determinar la siguiente notificación a enviar basada en sequence_order
          let nextNotificationId = null;
          let selectionReason = "";
          
          if (eventNotifications.length === 0) {
            // Si no tiene notificaciones previas, buscar la primera de la secuencia
            const { data: firstSequential } = await supabase
              .from("notification_settings")
              .select("id, sequence_order")
              .eq("invitation_event_id", invitation_event_id)
              .eq("sequence_order", 1)
              .limit(1);
            
            if (firstSequential?.length) {
              // Si hay una configuración con sequence_order=1, usarla (sea o no la actual)
              nextNotificationId = firstSequential[0].id;
              selectionReason = "Primera notificación de la secuencia";
              // Solo continuar si coincide con la configuración actual
              if (nextNotificationId !== settingId) {
                return null; // Se procesará cuando toque esa configuración
              }
            } else if (sequence_order === null) {
              // Si no hay configuración con sequence_order=1 y esta no tiene sequence_order, usarla
              nextNotificationId = settingId;
              selectionReason = "Notificación sin secuencia para creador sin notificaciones previas";
            }
          } else {

            const lastNotification = eventNotifications[eventNotifications.length - 1];

            const lastSequenceOrder = lastNotification.notification_settings?.sequence_order;
            
            console.log(`Última notificación - ID: ${lastNotification.notification_setting_id}, sequence_order: ${lastSequenceOrder || 'null'}`);
            
            // Si la última tiene sequence_order, buscar la siguiente en la secuencia
            if (lastSequenceOrder !== null) {
              const { data: nextSequential } = await supabase
                .from("notification_settings")
                .select("id, sequence_order, days_after")
                .eq("invitation_event_id", invitation_event_id)
                .eq("sequence_order", lastSequenceOrder + 1)
                .limit(1);
              
              if (nextSequential?.length) {
                // Verificar si han pasado suficientes días desde la última notificación
                const daysAfter = nextSequential[0].days_after || 0;
                const lastNotificationDate = new Date(lastNotification.sent_at);
                const daysSinceLastNotification = Math.floor(
                  (Date.now() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                console.log(`Días transcurridos desde última notificación: ${daysSinceLastNotification}, días requeridos: ${daysAfter}`);
                
                if (daysSinceLastNotification < daysAfter) {
                  console.log(`No han pasado suficientes días desde la última notificación (${daysSinceLastNotification}/${daysAfter})`);
                  return null; // No enviar notificación aún
                }
                
                // Si hay una siguiente en la secuencia y han pasado suficientes días, usarla
                nextNotificationId = nextSequential[0].id;
                selectionReason = `Siguiente en secuencia (${lastSequenceOrder} -> ${nextSequential[0].sequence_order}) después de ${daysSinceLastNotification} días`;
                // Solo continuar si coincide con la configuración actual
                if (nextNotificationId !== settingId) {
                  return null; // Se procesará cuando toque esa configuración
                }
              } else {
                // No hay siguiente notificación en la secuencia, no enviar nada
                console.log(`No hay más notificaciones en la secuencia después de ${lastSequenceOrder}, no se envían más`);
                return null; // No enviar más notificaciones para este creador
              }
            } 
            // Si la última no tiene sequence_order, no enviar más
            else {
              console.log(`La última notificación no tiene sequence_order, no se envían más`);
            }
          }
          
          // Si se determinó una notificación a enviar, agregar a la lista
          if (nextNotificationId) {
            console.log(`✅ SELECCIONADO - Creador ID: ${creator.id}, Notificación: ${nextNotificationId}, Razón: ${selectionReason}`);
            return {
              ...entry,
              nextNotificationId,
              selectionReason
            };
          } else {
            console.log(`❌ NO SELECCIONADO - Creador ID: ${creator.id}, No cumple criterios de secuencia`);
            return null;
          }
        });
        
        // Esperar a que se complete este lote antes de continuar con el siguiente
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Filtrar solo los creadores seleccionados de este lote
        const batchCreatorsToNotify = batchResults
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => (result as PromiseFulfilledResult<any>).value);
        
        // Agregar los creadores seleccionados al resultado final
        allCreatorsToNotify = [...allCreatorsToNotify, ...batchCreatorsToNotify];
      }
      
      const creatorsToNotify = allCreatorsToNotify;
      
      console.log(`Filtrados ${creatorsToNotify.length} creadores para enviar notificación según sequence_order`);
      
      if (!creatorsToNotify.length) continue;

      // 5. Preparar destinatarios para envío
      const recipients = creatorsToNotify.map(entry => {
        const creator = entry.creator_invitations;
        return {
          email: creator.email,
          name: `${creator.first_name || ''} ${creator.last_name || ''}`.trim(),
          variables: {
            name: `${creator.first_name || ''} ${creator.last_name || ''}`.trim(),
            invitationUrl: `${baseAppUrl}${creator.invitation_url}?notif=${setting.id}`
          },
          creatorId: creator.id,
          nextNotificationId: entry.nextNotificationId,
          selectionReason: entry.selectionReason
        };
      });

      // 6. Enviar campaña usando la función existente
      try {
        // Preparar el contenido HTML con variables de Mailjet
        let htmlContent = setting.message;
        // Reemplazar las variables en el formato de Mailjet
        htmlContent = htmlContent.replace(/\{\{full_name\}\}/g, "{{var:name}}");
        htmlContent = htmlContent.replace(/\{\{url\}\}/g, "{{var:invitationUrl}}");

        const { data: response, error } = await supabase.functions.invoke('mailjet-campaign', {
          body: {
            htmlContent: htmlContent,
            recipients: recipients,
            subject: setting.subject || "Recordatorio",
            customCampaign: setting.campaign_name
          }
        });

        if (error) throw error;
        
        console.log(`Campaña enviada exitosamente a ${recipients.length} destinatarios`);
        totalEnviados += recipients.length;
        
        // 7. Registrar las notificaciones enviadas en notification_logs
        const notificationLogsPromises = recipients.map(recipient => {
          return supabase.from("notification_logs").insert({
            channel: "email",
            status: "sent",
            invitation_id: recipient.creatorId,
            notification_setting_id: recipient.nextNotificationId,
            campaign_id: response.campaignId || null,
            sent_at: new Date().toISOString()
          });
        });
        
        // Esperar a que todos los registros se inserten
        await Promise.allSettled(notificationLogsPromises);
        console.log(`Registros de notificación creados para ${recipients.length} destinatarios`);
        
      } catch (error) {
        console.error(`Error al enviar campaña para configuración ${setting.id}:`, error);
      }
    }

    return new Response(`Procesamiento completado. Total de recordatorios enviados: ${totalEnviados}`, { status: 200 });
  } catch (error) {
    console.error("Error general en el procesamiento:", error);
    return new Response(`Error en el procesamiento: ${error.message}`, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://deno.land/manual/getting_started/setup_your_environment)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reminder-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
