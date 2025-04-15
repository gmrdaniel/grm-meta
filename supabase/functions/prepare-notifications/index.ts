import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { differenceInDays } from "https://esm.sh/date-fns";

// Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Configuración
const BATCH_SIZE = 500;
const MAX_INSERTS = 1000;

serve(async () => {
  const now = new Date();
  let totalInserted = 0;

  const { data: settings, error: settingsError } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("enabled", true);

  if (settingsError) {
    console.error("Error fetching settings:", settingsError);
    return new Response("Error fetching settings", { status: 500 });
  }

  for (const setting of settings) {
    const {
      id: setting_id,
      stage_id,
      channel,
      delay_days,
      frequency_days,
      max_notifications,
      invitation_status,
    } = setting;

    let offset = 0;

    while (true) {
      let query = supabase
        .from("creator_invitations")
        .select("id, email, stage_updated_at, current_stage_id, status")
        .eq("current_stage_id", stage_id);

      //filtrar por estatus en caso de que la configuracion tenga un status
      if (invitation_status) {
        query = query.eq("status", invitation_status);
      }

      const { data: invitations, error: fetchError } = await query.range(
        offset,
        offset + BATCH_SIZE - 1
      );

      if (fetchError || !invitations || invitations.length === 0) {
        break;
      }

      for (const invitation of invitations) {
        const {
          id: invitation_id,
          stage_updated_at,
          email,
          current_stage_id,
        } = invitation;

        if (!stage_updated_at || !email) continue;

        const enteredDate = new Date(stage_updated_at);
        const daysInStage = differenceInDays(now, enteredDate);

        if (daysInStage < delay_days) continue;

        // 1. Chequear si ya hay una notificación pendiente
        const { data: existingPending } = await supabase
          .from("notification_logs")
          .select("id")
          .eq("invitation_id", invitation_id)
          .eq("notification_setting_id", setting_id)
          .eq("status", "pending");

        if ((existingPending?.length || 0) > 0) continue;

        // 2. Verificar intentos anteriores (fallidos o enviados)
        const { data: logs } = await supabase
          .from("notification_logs")
          .select("id, sent_at, status")
          .eq("invitation_id", invitation_id)
          .eq("notification_setting_id", setting_id)
          .in("status", ["sent", "failed"])
          .order("sent_at", { ascending: false });

        if ((logs?.length || 0) >= max_notifications) continue;

        // 3. Aplicar frecuencia solo si el último fue enviado exitosamente
        const lastLog = logs?.[0];
        const lastSent = lastLog?.status === "sent" ? lastLog?.sent_at : null;
        const daysSinceLast = lastSent
          ? differenceInDays(now, new Date(lastSent))
          : Infinity;

        if (daysSinceLast < frequency_days) continue;

        // 4. Insertar nuevo log pendiente
        const { error: insertError } = await supabase
          .from("notification_logs")
          .insert({
            invitation_id,
            notification_setting_id: setting_id,
            stage_id: current_stage_id,
            channel,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(
            `Error inserting log for invitation ${invitation_id}:`,
            insertError
          );
        } else {
          totalInserted++;
        }

        if (totalInserted >= MAX_INSERTS) {
          console.warn("Max notifications inserted. Cutting execution.");
          return new Response(
            `Inserted ${totalInserted} pending notifications (max reached)`,
            {
              status: 200,
            }
          );
        }
      }

      offset += BATCH_SIZE;
    }
  }

  return new Response(`Inserted ${totalInserted} pending notifications`, {
    status: 200,
  });
});
