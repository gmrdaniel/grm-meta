
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const TIKTOK_API_KEY = Deno.env.get('TIKTOK_API_KEY') || '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5'
const TIKTOK_API_HOST = 'tiktok-api6.p.rapidapi.com'

interface RequestBody {
  username: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const body = await req.json() as RequestBody
    const { username } = body

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Missing username' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing direct TikTok details for username: ${username}`)

    // Make request to TikTok API
    const apiUrl = `https://${TIKTOK_API_HOST}/user/details`
    console.log(`API URL: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': TIKTOK_API_KEY,
        'x-rapidapi-host': TIKTOK_API_HOST,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username
      })
    });

    // Log detailed response for debugging
    console.log(`TikTok API response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TikTok API error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ error: `TikTok API error: ${response.status} - ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get response text and parse it
    const text = await response.text();
    console.log('Raw TikTok API response:', text);
    
    // Parse JSON carefully
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse TikTok API response:', e, 'Raw response:', text);
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse TikTok API response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    console.log('TikTok API response parsed:', JSON.stringify(data));
    
    // Return the complete data from TikTok API
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
