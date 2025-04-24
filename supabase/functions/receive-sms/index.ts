
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    
    // Extract SMS data from Twilio webhook
    const messageData = {
      twilio_message_id: formData.get('MessageSid'),
      message: formData.get('Body'),
      phone_number: formData.get('From')?.toString().replace('+', '') || '',
      country_code: formData.get('FromCountry') || '',
      direction: 'inbound',
      status: 'received',
      twilio_response: Object.fromEntries(formData.entries())
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the message in the database
    const { error } = await supabase
      .from('sms_logs')
      .insert([messageData])

    if (error) {
      console.error('Error storing SMS:', error)
      throw error
    }

    // Return success response to Twilio
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'text/xml'
        } 
      }
    )

  } catch (error) {
    console.error('Error in receive-sms function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process SMS' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
