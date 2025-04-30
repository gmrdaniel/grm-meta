// supabase/functions/update-pinterest-profile/index.ts
import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Tiene que ser la service role key
)

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders(),
    })
  }

  try {
    const { invitationId, pinterestUrl, contentCategoryIds } = await req.json()

    if (!invitationId || !pinterestUrl || !Array.isArray(contentCategoryIds)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders() }
      )
    }

    // Step 1: Fetch the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('creator_invitations')
      .select('email')
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Step 2: Find the user profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitation.email)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found for this email' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Step 3: Update the pinterest_url in the creator_invitations table
    const { error: updateInvitationError } = await supabase
      .from('creator_invitations')
      .update({ pinterest_url: pinterestUrl, updated_at: new Date().toISOString() })
      .eq('id', invitationId)

    if (updateInvitationError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update invitation' }),
        { status: 500, headers: corsHeaders() }
      )
    }

    // Step 4: Remove existing categories
    const { error: deleteCategoriesError } = await supabase
      .from('creator_profile_categories')
      .delete()
      .eq('creator_profile_id', profile.id)

    if (deleteCategoriesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to clear old categories' }),
        { status: 500, headers: corsHeaders() }
      )
    }

    // Step 5: Insert new categories
    if (contentCategoryIds.length > 0) {
      const inserts = contentCategoryIds.map((categoryId: string) => ({
        creator_profile_id: profile.id,
        content_category_id: categoryId,
      }))

      const { error: insertCategoriesError } = await supabase
        .from('creator_profile_categories')
        .insert(inserts)

      if (insertCategoriesError) {
        return new Response(
          JSON.stringify({ error: 'Failed to insert new categories' }),
          { status: 500, headers: corsHeaders() }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders() }
    )
  }
})

// Helper for CORS headers
const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Content-Type': 'application/json',
})
