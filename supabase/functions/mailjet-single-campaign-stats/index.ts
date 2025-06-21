// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_API_SECRET = Deno.env.get("MAILJET_API_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-environment"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  
  try {
    const { campaignId } = await req.json();
    
    if (!campaignId) {
      throw new Error("Se requiere el ID de la campaña");
    }
    
    // Consultar mensajes de la campaña específica
    const messagesResponse = await fetch(
      `https://api.mailjet.com/v3/REST/message?CampaignID=${campaignId}&MessageStatus=3,4,5,7&Limit=100&ShowContactAlt=true`, 
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)}`
        }
      }
    );
    
    if (!messagesResponse.ok) {
      throw new Error(`Error obteniendo mensajes: ${messagesResponse.status} ${messagesResponse.statusText}`);
    }
    
    const messagesData = await messagesResponse.json();
    
    // Obtener estadísticas detalladas de la campaña
    const statsResponse = await fetch(
      `https://api.mailjet.com/v3/REST/statcounters?SourceId=${campaignId}&CounterSource=Campaign&CounterTiming=Message&CounterResolution=Lifetime`, 
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)}`
        }
      }
    );
    
    if (!statsResponse.ok) {
      throw new Error(`Error obteniendo estadísticas: ${statsResponse.status} ${statsResponse.statusText}`);
    }
    
    const statsData = await statsResponse.json();
    
    // Procesar y agrupar los datos de mensajes por estado
    const messagesByStatus = messagesData.Data.reduce((acc, message) => {
      const status = message.Status || "unknown";
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});
    
    return new Response(JSON.stringify({
      campaign: {
        id: campaignId,
        stats: statsData.Data[0] || {},
        messagesByStatus,
        messagesCount: messagesData.Count,
        messages: messagesData.Data
      }
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
