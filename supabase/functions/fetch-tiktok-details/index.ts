
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const TIKTOK_API_KEY = Deno.env.get('TIKTOK_API_KEY') || '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5'
const TIKTOK_API_HOST = 'tiktok-api6.p.rapidapi.com'

interface RequestBody {
  username: string;
  creatorId: string;
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
    const { username, creatorId } = body

    if (!username || !creatorId) {
      return new Response(
        JSON.stringify({ error: 'Missing username or creatorId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing TikTok details for username: ${username}, creatorId: ${creatorId}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Process in background
    const processRequest = async () => {
      try {
        console.log('Making request to TikTok API')
        
        // Make request to TikTok API with improved error handling
        const apiUrl = `https://${TIKTOK_API_HOST}/user/info?username=${encodeURIComponent(username)}`
        console.log(`API URL: ${apiUrl}`)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': TIKTOK_API_KEY,
            'X-RapidAPI-Host': TIKTOK_API_HOST
          }
        });

        // Log detailed response for debugging
        console.log(`TikTok API response status: ${response.status}`)
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`TikTok API error: ${response.status} - ${errorText}`);
          return;
        }

        const data = await response.json();
        console.log('TikTok API response received:', JSON.stringify(data));
        
        // Extract relevant info from TikTok API response
        if (!data || !data.stats) {
          console.error('No data or stats found in API response:', JSON.stringify(data));
          return;
        }
        
        // Extract followers and other statistics from the correct path in response
        const followers = data.stats?.followerCount || 0;
        
        // Calculate engagement rate based on total likes / followers * 100
        const totalLikes = data.stats?.heartCount || 0;
        const engagement = followers > 0 ? (totalLikes / followers) * 100 : 0;
        
        // Determine eligibility (example: eligible if has more than 10K followers)
        const eligible = followers >= 10000;

        console.log(`Extracted data: followers=${followers}, engagement=${engagement}, eligible=${eligible}`);

        // Update creator in database
        const { error: updateError } = await supabase
          .from('inventario_creadores')
          .update({
            seguidores_tiktok: followers,
            engagement_tiktok: engagement,
            elegible_tiktok: eligible,
          })
          .eq('id', creatorId);

        if (updateError) {
          console.error('Error updating creator:', updateError);
        } else {
          console.log(`Successfully updated TikTok details for creator ${creatorId}`);
        }
      } catch (error) {
        console.error('Error processing TikTok details:', error);
      }
    };

    // Start processing in the background
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(processRequest());

    // Return immediate success response
    return new Response(
      JSON.stringify({ 
        message: 'TikTok details update request received and being processed',
        status: 'processing'
      }),
      {
        status: 202,
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
