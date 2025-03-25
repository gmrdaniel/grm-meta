
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Process in background
    const processRequest = async () => {
      try {
        // Make request to TikTok API
        const response = await fetch(`https://${TIKTOK_API_HOST}/user/details`, {
          method: 'POST',
          headers: {
            'x-rapidapi-key': TIKTOK_API_KEY,
            'x-rapidapi-host': TIKTOK_API_HOST,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`TikTok API error: ${response.status} - ${errorText}`)
          return
        }

        const data = await response.json()
        
        // Extract relevant info from TikTok API response
        const userStats = data?.data?.stats
        if (!userStats) {
          console.error('No user stats found in API response')
          return
        }

        const followers = userStats.followerCount || 0
        
        // Calculate engagement rate (likes + comments + shares) / followers * 100
        const totalLikes = userStats.heartCount || 0
        const totalVideos = userStats.videoCount || 1  // Avoid division by zero
        const avgLikesPerVideo = totalVideos > 0 ? totalLikes / totalVideos : 0
        
        // Simplified engagement calculation
        const engagement = followers > 0 ? (avgLikesPerVideo / followers) * 100 : 0
        
        // Determine eligibility (example: eligible if has more than 10K followers)
        const eligible = followers >= 10000

        // Update creator in database
        const { error: updateError } = await supabase
          .from('inventario_creadores')
          .update({
            seguidores_tiktok: followers,
            engagement_tiktok: engagement,
            elegible_tiktok: eligible,
          })
          .eq('id', creatorId)

        if (updateError) {
          console.error('Error updating creator:', updateError)
        }

        console.log(`Updated TikTok details for creator ${creatorId}`)
      } catch (error) {
        console.error('Error processing TikTok details:', error)
      }
    }

    // Start processing in the background
    EdgeRuntime.waitUntil(processRequest())

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
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
