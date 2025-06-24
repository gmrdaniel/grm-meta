// supabase/functions/instagram-details/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      headers: corsHeaders,
      status: 400,
    });
  }

  const apiKey = Deno.env.get("RAPIDAPI_KEY");
  const apiHost = "instagram120.p.rapidapi.com";
  console.log("apiKey", apiKey);
  try {
    const apiRes = await fetch(`https://${apiHost}/api/instagram/userInfo`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey ?? "",
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
      }),
    });

    const data = await apiRes.json();

    return new Response(JSON.stringify(data), {
      headers: corsHeaders,
      status: apiRes.status,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
