// Edge Function: facebook-page-details

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper para CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-environment",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pageUrl } = await req.json();

    if (!pageUrl || typeof pageUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid pageUrl" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");

    // 1. Llamada a page/details
    const encodedPageUrl = encodeURIComponent(pageUrl);
    const pageDetailsUrl = `https://facebook-scraper3.p.rapidapi.com/page/details?url=${encodedPageUrl}`;

    const pageRes = await fetch(pageDetailsUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey!,
        "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
      },
    });

    const pageData = await pageRes.json();

    if (!pageRes.ok) {
      return new Response(JSON.stringify({ error: pageData }), {
        status: pageRes.status,
        headers: corsHeaders,
      });
    }

    // 2. Llamada a profile/details_url
    const profileDetailsUrl = `https://facebook-scraper3.p.rapidapi.com/profile/details_url?url=${encodedPageUrl}`;

    const profileRes = await fetch(profileDetailsUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey!,
        "x-rapidapi-host": "facebook-scraper3.p.rapidapi.com",
      },
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: profileData }), {
        status: profileRes.status,
        headers: corsHeaders,
      });
    }

    // Respuesta final con claves correctas
    const combined = {
      results: pageData.results ?? null,
      profile: profileData.profile ?? null,
    };

    return new Response(JSON.stringify(combined), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error occurred" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
