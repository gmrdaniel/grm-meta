import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const apiKey = Deno.env.get("MAILJET_API_KEY");
const apiSecret = Deno.env.get("MAILJET_API_SECRET");
const senderEmail = Deno.env.get("MAILJET_SENDER_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-environment",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { templateId, recipients, subject, variables, textContent, htmlContent, customCampaign, deduplicateCampaign } = await req.json();

    // Validación de campos requeridos
    if (!recipients || !recipients.length) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: recipients",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validar que haya al menos contenido de texto o HTML si no hay templateId
    if (!templateId && !textContent && !htmlContent) {
      return new Response(
        JSON.stringify({
          error: "Either templateId or textContent/htmlContent must be provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Preparar mensajes para cada destinatario
    const messages = recipients.map((recipient) => {
      const message = {
        From: { Email: senderEmail, Name: "Nicole Kressler" },
        To: [{ Email: recipient.email, Name: recipient.name || "Usuario" }],
        Subject: subject,
        TemplateID: templateId,
        TemplateLanguage: true,
        TextPart: "",
        HTMLPart: "",
        Variables: { ...variables, ...recipient.variables },
        CustomCampaign: recipient.customCampaign
      };

      if (templateId) {
        message.TemplateID = parseInt(templateId);
        message.TemplateLanguage = true;
      } else {
        if (textContent) message.TextPart = textContent;
        if (htmlContent) message.HTMLPart = htmlContent;
      }

      // Agregar opciones de campaña personalizada
      if (customCampaign) message.CustomCampaign = customCampaign;
      //if (deduplicateCampaign !== undefined) message.DeduplicateCampaign = deduplicateCampaign;

      return message;
    });

    // Enviar campaña usando Mailjet
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${apiKey}:${apiSecret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Messages: messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mailjet error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Obtener el CampaignID
    const campaignResponse = await fetch(`https://api.mailjet.com/v3/REST/campaign?CustomCampaign=${customCampaign}`, {
      headers: {
        Authorization: "Basic " + btoa(`${apiKey}:${apiSecret}`)
      }
    });
    const campaignData = await campaignResponse.json();
    const campaignId = campaignData.Data[0]?.ID || null;
    return new Response(JSON.stringify({ 
      success: true, 
      data,
      campaignId // Incluir el campaignId en la respuesta
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

// Función auxiliar para renderizar plantillas
function renderTemplate(
  template: string,
  variables: Record<string, string | undefined>
): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return variables[key.trim()] || "";
  });
}
