// Edge Function: facebook-page-details

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper para CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-environment",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pageUrl } = await req.json();

    if (!pageUrl || typeof pageUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid pageUrl" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    console.log('pageUrl', pageUrl)
    const encodedUrl = encodeURIComponent(pageUrl);
    const url = `https://facebook-scraper3.p.rapidapi.com/page/details?url=${encodedUrl}`;
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
   
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey!,
        "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ data: data.results }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
