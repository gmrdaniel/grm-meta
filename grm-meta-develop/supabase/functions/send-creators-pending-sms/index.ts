import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import twilio from "npm:twilio";

// Supabase y Twilio
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const twilioClient = twilio(
  Deno.env.get("TWILIO_ACCOUNT_SID")!,
  Deno.env.get("TWILIO_AUTH_TOKEN")!
);

const twilioSender = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const baseAppUrl = Deno.env.get("BASE_APP_URL")!;
const MAX_BATCH = 100;

serve(async () => {
  const { data: pendingLogs, error } = await supabase
    .from("notification_logs")
    .select(`
      id,
      invitation_id,
      notification_setting_id,
      channel,
      creator_invitations:invitation_id (
        id,
        first_name,
        phone_country_code,
        phone_number,
        phone_verified,
        invitation_code,
        invitation_url,
        invitation_type,
        social_media_handle,
        status
      ),
      notification_settings:notification_setting_id (
        message,
        max_notifications
      )
    `)
    .in("status", ["pending", "failed"])
    .eq("channel", "sms")
    .limit(MAX_BATCH);

  if (error) {
    console.error("Error fetching SMS logs:", error);
    return new Response("Error fetching logs", { status: 500 });
  }

  let sentCount = 0;

  for (const log of pendingLogs) {
    const invitation = log.creator_invitations;
    const setting = log.notification_settings;
    const logId = log.id;

    const fullPhone = buildFullPhone(invitation);
    if (!fullPhone) {
      await markFailed(logId, "Invalid or unverified phone");
      continue;
    }

    const { count: sentCountForThis } = await supabase
      .from("notification_logs")
      .select("*", { count: "exact", head: true })
      .eq("invitation_id", invitation.id)
      .eq("notification_setting_id", log.notification_setting_id)
      .eq("status", "sent");

    if ((sentCountForThis || 0) >= (setting?.max_notifications || 1)) {
      await markFailed(logId, "Max notifications reached");
      continue;
    }

    // Reemplazar variables en plantilla
    const requiredVars = extractVariables(setting.message);
    const variables: Record<string, string | undefined> = {};
    for (const key of requiredVars) {
      variables[key] = generateValueFor(key, invitation);
    }

    const body = renderTemplate(setting.message, variables);

    try {
      await twilioClient.messages.create({
        body,
        from: twilioSender,
        to: fullPhone
      });

      await supabase.from("notification_logs").update({
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: null
      }).eq("id", logId);

      sentCount++;
    } catch (err) {
      console.error("Error sending SMS:", err);
      await markFailed(logId, (err as Error).message || "SMS error");
    }
  }

  return new Response(`SMS sent: ${sentCount}`, { status: 200 });
});

// ===================== UTILS ========================

function extractVariables(template: string): string[] {
  const matches = template.match(/{{(.*?)}}/g) || [];
  return matches.map((m) => m.replace(/{{|}}/g, "").trim());
}

function renderTemplate(template: string, variables: Record<string, string | undefined>): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || "");
}

function generateValueFor(key: string, invitation: any): string | undefined {
  
  if (key === "url") {
    return `${baseAppUrl}${invitation.invitation_url}`;
  }
  
  return invitation[key];

}


function buildFullPhone(invitation: any): string | null {
  if (!invitation.phone_verified) return null;
  if (!invitation.phone_country_code || !invitation.phone_number) return null;
  return `${invitation.phone_country_code}${invitation.phone_number}`;
}

async function markFailed(logId: string, reason: string) {
  await supabase.from("notification_logs").update({
    status: "failed",
    updated_at: new Date().toISOString(),
    error_message: reason
  }).eq("id", logId);
}
