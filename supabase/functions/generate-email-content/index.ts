
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-environment",
};

interface GenerateEmailRequest {
  name: string;
  tiktokUsername: string;
  emailType: "invitación" | "bienvenida" | "recordatorio";
  tiktokProfileData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { name, tiktokUsername, emailType, tiktokProfileData }: GenerateEmailRequest = await req.json();
    
    let prompt = "";
    let systemPrompt = "You are an email content generator for a creator marketing platform. Write an engaging and personalized email in Spanish.";
    
    if (tiktokProfileData) {
      prompt = `Generate a personalized ${emailType} email for a TikTok creator named ${name}. 
      Their TikTok username is @${tiktokUsername}.
      
      Here's some information about their TikTok profile:
      - Follower count: ${tiktokProfileData.stats?.followerCount || 'Unknown'}
      - Total likes: ${tiktokProfileData.stats?.heartCount || 'Unknown'}
      - Bio: ${tiktokProfileData.user?.signature || 'No bio provided'}
      
      Write a brief, professional email in HTML format that:
      1. Addresses them by name
      2. Makes specific reference to their TikTok content style based on their bio
      3. Includes a call to action
      4. Is appropriate for a ${emailType} email
      5. Is written in Spanish
      
      Only respond with the HTML content of the email, nothing else.`;
    } else {
      prompt = `Generate a personalized ${emailType} email for a TikTok creator named ${name}. 
      Their TikTok username is @${tiktokUsername}.
      
      Write a brief, professional email in HTML format that:
      1. Addresses them by name
      2. Makes reference to their TikTok content (generically)
      3. Includes a call to action
      4. Is appropriate for a ${emailType} email
      5. Is written in Spanish
      
      Only respond with the HTML content of the email, nothing else.`;
    }
    
    // Here we would normally use the OpenAI API directly, but for this demo
    // we'll use a template-based approach for simplicity
    let emailContent = "";
    
    // Simple template-based generation as placeholder
    // In a real implementation, this would be replaced with an actual AI model call
    switch(emailType) {
      case "invitación":
        emailContent = `
          <h1>Invitación para ${name}</h1>
          <p>Hola ${name},</p>
          <p>Hemos estado siguiendo tu contenido en <a href="https://www.tiktok.com/@${tiktokUsername}" target="_blank">TikTok</a> y nos ha impresionado tu ${tiktokProfileData?.user?.signature ? 'creatividad en ' + tiktokProfileData.user.signature : 'estilo único'}.</p>
          <p>Con ${tiktokProfileData?.stats?.followerCount ? tiktokProfileData.stats.followerCount + ' seguidores' : 'tu audiencia'}, creemos que hay grandes oportunidades para colaborar juntos.</p>
          <p>¿Te gustaría unirte a nuestra red de creadores y acceder a campañas exclusivas?</p>
          <p>Esperamos tu respuesta,</p>
          <p>Equipo de La Neta</p>
        `;
        break;
      case "bienvenida":
        emailContent = `
          <h1>¡Bienvenido/a ${name}!</h1>
          <p>Hola ${name},</p>
          <p>¡Estamos encantados de darte la bienvenida a nuestra plataforma!</p>
          <p>Hemos visto tus vídeos en <a href="https://www.tiktok.com/@${tiktokUsername}" target="_blank">TikTok</a> y estamos impresionados con ${tiktokProfileData?.stats?.heartCount ? 'los ' + tiktokProfileData.stats.heartCount + ' likes que has conseguido' : 'tu contenido'}.</p>
          <p>Estamos seguros de que juntos podremos crear campañas increíbles que resonarán con tu audiencia.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos cordiales,</p>
          <p>Equipo de La Neta</p>
        `;
        break;
      case "recordatorio":
        emailContent = `
          <h1>Recordatorio importante</h1>
          <p>Hola ${name},</p>
          <p>Notamos que aún no has completado tu perfil en nuestra plataforma.</p>
          <p>Como creador con ${tiktokProfileData?.stats?.followerCount ? tiktokProfileData.stats.followerCount + ' seguidores' : 'presencia'} en <a href="https://www.tiktok.com/@${tiktokUsername}" target="_blank">TikTok</a>, estás dejando pasar oportunidades valiosas.</p>
          <p>Completa tu perfil hoy y comienza a recibir propuestas de marcas interesadas en tu contenido.</p>
          <p>Estamos aquí para ayudarte,</p>
          <p>Equipo de La Neta</p>
        `;
        break;
    }

    return new Response(JSON.stringify({ emailContent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error generating email content:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
