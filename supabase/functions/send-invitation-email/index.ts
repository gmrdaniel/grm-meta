import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  subject: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, html }: EmailRequest = await req.json();

    // Detectar entorno
    const isProduction =
      req.headers.get("x-environment") === "production" ||
      Deno.env.get("ENVIRONMENT") === "production";

    // Email real o de prueba
    const recipientEmail = isProduction ? email : "onboarding@resend.dev";

    console.log(`Environment: ${isProduction ? "production" : "development"}`);
    console.log(`Sending email to: ${recipientEmail} (original: ${email})`);

    const emailResponse = await resend.emails.send({
      from: "Team La Neta <onboarding@laneta.com>",
      to: [recipientEmail],
      subject,
      html: isProduction
        ? html
        : `${html}<hr><p><strong>Nota de desarrollo:</strong> Este correo era para: ${email}</p>`,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
