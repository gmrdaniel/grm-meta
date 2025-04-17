import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Inicializa Supabase y Resend
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const senderEmail = Deno.env.get("RESEND_SENDER_EMAIL");
const baseAppUrl = Deno.env.get("BASE_APP_URL");

const MAX_BATCH = 100; // máximo por ejecución

serve(async () => {
  const { data: pendingLogs, error } = await supabase
    .from("notification_logs")
    .select(
      `
    id,
    invitation_id,
    notification_setting_id,
    channel,
    creator_invitations:invitation_id (
      first_name,
      email,
      invitation_code,
      invitation_url
    ),
    notification_settings:notification_setting_id (
      subject,
      message,
      type,
      template_id,
      email_templates:template_id (
        html
      )
    )
  `
    )
    .eq("status", "pending")
    .limit(MAX_BATCH);

  if (error) {
    console.error("Error fetching pending logs:", error);
    return new Response("Error fetching pending logs", { status: 500 });
  }

  let sentCount = 0;

  for (const log of pendingLogs) {
    const invitation = log.creator_invitations;
    const setting = log.notification_settings;

    const success = await sendNotification(log.channel, invitation, setting);

    await supabase
      .from("notification_logs")
      .update({
        status: success ? "sent" : "failed",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: success ? null : "Failed to send",
      })
      .eq("id", log.id);

    if (success) sentCount++;
  }

  return new Response(`Sent ${sentCount} notifications`, { status: 200 });
});

// ===================== UTILIDADES ========================

function extractVariables(template: string): string[] {
  const matches = template.match(/{{(.*?)}}/g) || [];
  return matches.map((match) => match.replace(/{{|}}/g, "").trim());
}

function renderTemplate(
  template: string,
  variables: Record<string, string | undefined>
): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return variables[key.trim()] || "";
  });
}

function generateValueFor(key: string, invitation: any): string | undefined {
  switch (key) {
    case "url":
      return `${baseAppUrl}${invitation.invitation_url}`;
    case "stage_updated_at":
      return invitation.stage_updated_at
        ? new Date(invitation.stage_updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : undefined;
    default:
      return invitation[key];
  }
}


// ===================== ENVÍO ========================

async function sendNotification(
  channel: string,
  invitation: any,
  setting: any
): Promise<boolean> {
  const requiredVars = extractVariables(setting.message);
  const variables: Record<string, string | undefined> = {};

  for (const key of requiredVars) {
    variables[key] = generateValueFor(key, invitation);
  }

  let html = renderTemplate(setting.message, variables);

  // Si hay plantilla asociada, embebe el contenido
  if (setting.email_templates?.html) {
    html = setting.email_templates.html.replace("{{content}}", html);
  }

  const subject = renderTemplate(setting.subject || "Notification", variables);

  if (channel === "email") {
    try {
      const response = await resend.emails.send({
        from: senderEmail,
        to: [invitation.email],
        subject,
        html,
      });

      if (response.error) {
        console.error("Resend error:", response.error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error sending email:", err);
      return false;
    }
  }

  if (channel === "sms") {
    console.log(`(TODO) SMS to ${invitation.phone_number}`);
    // Aquí puedes integrar Twilio, Vonage o similar.
    return false;
  }

  return false;
}
