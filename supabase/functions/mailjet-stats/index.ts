// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.log("Hello from Functions!");
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_API_SECRET = Deno.env.get("MAILJET_API_SECRET");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-environment"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Primero obtenemos las últimas 10 campañas
    const campaignsResponse = await fetch("https://api.mailjet.com/v3/REST/campaign?&Sort=CreatedAt+DESC", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)}`
      }
    });
    if (!campaignsResponse.ok) {
      throw new Error(`Error obteniendo campañas: ${campaignsResponse.status} ${campaignsResponse.statusText}`);
    }
    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.Data;
    // Obtenemos las estadísticas detalladas para cada campaña
    console.log(campaigns);
    const statsPromises = campaigns.map(async (campaign)=>{
      const statsResponse = await fetch(`https://api.mailjet.com/v3/REST/statcounters?SourceId=${campaign.ID}&CounterSource=Campaign&CounterTiming=Message&CounterResolution=Lifetime`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)}`
        }
      });
      if (!statsResponse.ok) {
        throw new Error(`Error obteniendo estadísticas: ${statsResponse.status} ${statsResponse.statusText}`);
      }
      const statsData = await statsResponse.json();
      const stats = statsData.Data[0] || {};
      return {
        CampaignID: campaign.ID,
        CampaignName: campaign.Subject,
        EventClickDelay: stats.EventClickDelay || "0",
        EventClickCount: stats.EventClickCount || "0",
        EventOpenDelay: stats.EventOpenDelay || "0",
        EventOpenedCount: stats.EventOpenedCount || "0",
        MessageBlockedCount: stats.MessageBlockedCount || "0",
        MessageClickedCount: stats.MessageClickedCount || "0",
        MessageDeferredCount: stats.MessageDeferredCount || "0",
        MessageHardBouncedCount: stats.MessageHardBouncedCount || "0",
        MessageOpenedCount: stats.MessageOpenedCount || "0",
        MessageQueuedCount: stats.MessageQueuedCount || "0",
        MessageSentCount: stats.MessageSentCount || "0",
        MessageSoftBouncedCount: stats.MessageSoftBouncedCount || "0",
        MessageSpamCount: stats.MessageSpamCount || "0",
        MessageUnsubscribedCount: stats.MessageUnsubscribedCount || "0",
        MessageWorkflowExitedCount: stats.MessageWorkflowExitedCount || "0",
        Timeslice: stats.Timeslice || "0"
      };
    });
    const campaignStats = await Promise.all(statsPromises);
    return new Response(JSON.stringify({
      Count: campaignStats.length,
      Data: campaignStats,
      Total: campaignStats.length
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
}); /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/mailjet-stats' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/ 
