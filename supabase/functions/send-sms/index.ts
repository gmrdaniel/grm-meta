
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, countryCode, name, message, templateId, sentBy } = await req.json();
    
    if (!phoneNumber || !countryCode || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure countryCode doesn't have a plus sign already
    const formattedCountryCode = countryCode.startsWith('+') ? countryCode.substring(1) : countryCode;
    const formattedPhone = `+${formattedCountryCode}${phoneNumber}`;
    
    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhone)) {
      console.error("Invalid phone number format:", formattedPhone);
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log the values to help with debugging
    console.log("Sending SMS to:", formattedPhone);
    console.log("From:", TWILIO_PHONE_NUMBER);
    console.log("Using Account SID:", TWILIO_ACCOUNT_SID?.substring(0, 5) + "...");
    console.log("Auth token present:", !!TWILIO_AUTH_TOKEN);

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Twilio credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure proper encoding of auth header
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    console.log("Sending request to:", twilioUrl);
    
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: TWILIO_PHONE_NUMBER,
        Body: message
      }).toString(),
    });

    const twilioData = await twilioResponse.json();
    console.log("Twilio response status:", twilioResponse.status);
    console.log("Twilio response:", JSON.stringify(twilioData).substring(0, 200));
    
    // Handle specific Twilio error codes
    if (twilioData.code === 21612) {
      console.error("Twilio error 21612: Invalid 'To' and 'From' combination");
      return new Response(
        JSON.stringify({ 
          error: "This phone number combination is not allowed. The 'From' number may not be authorized to send messages to this region.",
          code: 21612,
          twilioError: twilioData.message
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log the SMS in the database
    const { error: logError } = await supabase.from('sms_logs').insert({
      phone_number: phoneNumber,
      country_code: formattedCountryCode,
      recipient_name: name,
      message,
      status: twilioResponse.ok ? 'sent' : 'failed',
      twilio_message_id: twilioData.sid,
      twilio_response: twilioData,
      error_message: !twilioResponse.ok ? twilioData.message : null,
      sent_by: sentBy,
      template_id: templateId,
      sent_at: new Date().toISOString()
    });

    if (logError) {
      console.error("Error logging SMS:", logError);
    }

    if (!twilioResponse.ok) {
      throw new Error(twilioData.message || "Failed to send SMS");
    }

    return new Response(
      JSON.stringify({ success: true, data: twilioData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-sms function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send SMS" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
