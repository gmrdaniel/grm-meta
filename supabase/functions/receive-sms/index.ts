
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
    console.log('SMS webhook received');
    
    let messageData;
    const contentType = req.headers.get('content-type') || '';
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      // Handle JSON data
      const jsonData = await req.json();
      console.log('Received JSON data:', jsonData);
      
      messageData = {
        twilio_message_id: jsonData.MessageSid || '',
        message: jsonData.Body || '',
        phone_number: (jsonData.From || '').replace('+', ''),
        country_code: jsonData.FromCountry || '',
        direction: 'inbound',
        status: 'received',
        twilio_response: jsonData
      };
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle URL-encoded form data
      const text = await req.text();
      console.log('Received URL-encoded data:', text);
      
      const formData = new URLSearchParams(text);
      messageData = {
        twilio_message_id: formData.get('MessageSid') || '',
        message: formData.get('Body') || '',
        phone_number: (formData.get('From') || '').toString().replace('+', ''),
        country_code: formData.get('FromCountry') || '',
        direction: 'inbound',
        status: 'received',
        twilio_response: Object.fromEntries(formData.entries())
      };
    } else {
      // Try to parse as form data as a fallback
      try {
        const formData = await req.formData();
        console.log('Received form data successfully');
        
        messageData = {
          twilio_message_id: formData.get('MessageSid') || '',
          message: formData.get('Body') || '',
          phone_number: (formData.get('From') || '').toString().replace('+', ''),
          country_code: formData.get('FromCountry') || '',
          direction: 'inbound',
          status: 'received',
          twilio_response: Object.fromEntries(formData.entries())
        };
      } catch (formError) {
        console.error('Failed to parse as form data:', formError);
        
        // Last resort: try to parse the raw request body
        const text = await req.text();
        console.log('Raw request body:', text);
        
        // Try to extract data from the raw text (simplified approach)
        const bodyMatch = text.match(/Body=([^&]+)/);
        const fromMatch = text.match(/From=([^&]+)/);
        const sidMatch = text.match(/MessageSid=([^&]+)/);
        const countryMatch = text.match(/FromCountry=([^&]+)/);
        
        messageData = {
          twilio_message_id: sidMatch ? sidMatch[1] : '',
          message: bodyMatch ? decodeURIComponent(bodyMatch[1].replace(/\+/g, ' ')) : '',
          phone_number: fromMatch ? fromMatch[1].replace('+', '') : '',
          country_code: countryMatch ? countryMatch[1] : '',
          direction: 'inbound',
          status: 'received',
          twilio_response: { rawBody: text }
        };
      }
    }

    console.log('Processed message data:', messageData);

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

    console.log('SMS stored successfully')

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
