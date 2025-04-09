import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { differenceInDays } from "https://esm.sh/date-fns";

// Inicializa Supabase con la Service Role Key
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  const { data: settings, error: settingsError } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("enabled", true);

  if (settingsError) {
    console.error("Error fetching settings:", settingsError);
    return new Response("Error", { status: 500 });
  }

  for (const setting of settings) {
    const {
      id: setting_id,
      stage_id,
      channel,
      delay_days,
      frequency_days,
      max_notifications
    } = setting;

    const { data: invitations } = await supabase
      .from("creator_invitations")
      .select("*")
      .eq("current_stage_id", stage_id);

    if (!invitations) continue;

    for (const invitation of invitations) {
      const { id: invitation_id, created_at, email, current_stage_id } = invitation;

      if (!created_at || !email) continue;

      const enteredDate = new Date(created_at);
      const now = new Date();
      const daysInStage = differenceInDays(now, enteredDate);

      if (daysInStage < delay_days) continue;

      const { data: logs } = await supabase
        .from("notification_logs")
        .select("id, sent_at")
        .eq("invitation_id", invitation_id)
        .eq("notification_setting_id", setting_id)
        .order("sent_at", { ascending: false });

      if ((logs?.length || 0) >= max_notifications) continue;

      const lastSent = logs?.[0]?.sent_at;
      const daysSinceLast = lastSent ? differenceInDays(now, new Date(lastSent)) : Infinity;

      if (daysSinceLast < frequency_days) continue;

      // Insertar notificación pendiente
      const { error: insertError } = await supabase.from("notification_logs").insert({
        invitation_id,
        notification_setting_id: setting_id,
        stage_id: current_stage_id,
        channel,
        status: "pending"
      });

      if (insertError) {
        console.error(`Error inserting log for invitation ${invitation_id}:`, insertError);
      }
    }
  }

  return new Response("Prepared pending notifications", { status: 200 });
});
