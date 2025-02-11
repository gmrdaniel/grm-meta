
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Verify user is admin using our secure function
    const { data: isAdmin, error: adminError } = await supabaseAdmin.rpc('is_admin', {
      user_id: user.id,
    })

    if (adminError || !isAdmin) {
      throw new Error('Unauthorized: User is not an admin')
    }

    // Parse the request body
    const { action } = await req.json()

    let result
    switch (action) {
      case 'listUsers':
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError
        result = users
        break
      
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
