
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InvitationEmailRequest {
  email: string;
  invitationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    console.log("Parsing request body");
    const body = await req.text();
    console.log("Request body:", body);
    
    let data: InvitationEmailRequest;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email, invitationUrl } = data;
    
    if (!email || !invitationUrl) {
      console.error("Missing required fields:", { email, invitationUrl });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email or invitationUrl" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Determine the environment from request headers or env variables
    const isProduction = req.headers.get("x-environment") === "production" ||
                         Deno.env.get("ENVIRONMENT") === "production";
    
    // Choose recipient email based on environment
    const recipientEmail = isProduction 
      ? email  // Use actual email in production
      : "onboarding@resend.dev"; // Use test email in development
    
    console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`Sending invitation email to: ${recipientEmail} (original: ${email})`);

    const emailResponse = await resend.emails.send({
      from: "Laneta <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: "Invitación para unirte como creador",
      html: `
        <h1>¡Has sido invitado!</h1>
        <p>Te han invitado a unirte como creador. Para completar tu registro, haz clic en el siguiente enlace:</p>
        <a href="${invitationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Completar registro
        </a>
        <p>Este enlace es único y personal. No lo compartas con nadie.</p>
        <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
        ${!isProduction ? `<p><strong>Nota de desarrollo:</strong> Este correo estaba originalmente destinado a: ${email}</p>` : ''}
      `,
    });

    console.log("Email sending response:", emailResponse);

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
