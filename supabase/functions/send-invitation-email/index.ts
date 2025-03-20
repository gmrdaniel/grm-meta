
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  invitationUrl: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, invitationUrl, name }: InvitationEmailRequest = await req.json();
    
    // Determine the environment from request headers or env variables
    const isProduction = req.headers.get("x-environment") === "production" ||
                         Deno.env.get("ENVIRONMENT") === "production";

    // Choose recipient email based on environment
    const recipientEmail = isProduction
      ? email
      : "onboarding@resend.dev";

    console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`Sending invitation email to: ${recipientEmail} (original: ${email})`);

    const emailResponse = await resend.emails.send({
      from: "Team La Neta <onboarding@laneta.com>",
      to: [recipientEmail],
      subject: "Invitación para unirte como creador",
      html: `
        <h1>¡Has sido invitado!</h1>
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>Te han invitado a unirte como creador. Para completar tu registro, haz clic en el siguiente enlace:</p>
        <a href="${invitationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Completar registro
        </a>
        <p>Este enlace es único y personal. No lo compartas con nadie.</p>
        <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
        ${!isProduction ? `<p><strong>Nota de desarrollo:</strong> Este correo estaba originalmente destinado a: ${email}</p>` : ''}
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
