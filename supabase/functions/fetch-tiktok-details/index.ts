
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import * as https from 'https';

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
        
        // Function to fetch TikTok API data using the HTTP/HTTPS pattern from the example
        const fetchTikTokData = () => {
          return new Promise((resolve, reject) => {
            const options = {
              method: 'GET',
              hostname: TIKTOK_API_HOST,
              path: `/user/details?username=${encodeURIComponent(username)}`,
              headers: {
                'x-rapidapi-key': TIKTOK_API_KEY,
                'x-rapidapi-host': TIKTOK_API_HOST
              }
            };

            const req = https.request(options, (res) => {
              const chunks: Uint8Array[] = [];

              res.on('data', (chunk) => {
                chunks.push(chunk);
              });

              res.on('end', () => {
                const body = Buffer.concat(chunks);
                const responseText = new TextDecoder().decode(body);
                
                try {
                  // Try to parse JSON
                  const data = JSON.parse(responseText);
                  if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                  } else {
                    reject(new Error(`TikTok API error: ${res.statusCode} - ${responseText}`));
                  }
                } catch (error) {
                  reject(new Error(`Error parsing TikTok API response: ${error.message}`));
                }
              });
            });

            req.on('error', (error) => {
              reject(error);
            });

            req.end();
          });
        };

        // Make the request using our helper function
        const data = await fetchTikTokData();
        console.log('TikTok API response received:', JSON.stringify(data));
        
        // Extract relevant info from TikTok API response
        if (!data || !data.data) {
          console.error('No data found in API response');
          return;
        }
        
        // Extract followers and other statistics
        const followers = data.data.followers || 0;
        
        // Calculate engagement rate based on total_heart (likes) / followers * 100
        const totalLikes = data.data.total_heart || 0;
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
