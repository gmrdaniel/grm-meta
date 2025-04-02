import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_SERVICE_SID = Deno.env.get("TWILIO_SERVICE_SID");
const TWILIO_API_ENDPOINT = "https://verify.twilio.com/v2/Services";
// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { action, phoneNumber, countryCode, verificationCode, invitationId } = await req.json();
    const formattedPhone = `${countryCode}${phoneNumber}`;
    // Basic validation
    if (!action || !phoneNumber || !countryCode) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required parameters"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Create Basic Auth header for Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    let response;
    if (action === "send") {
      // Send verification code
      response = await fetch(`${TWILIO_API_ENDPOINT}/${TWILIO_SERVICE_SID}/Verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`
        },
        body: new URLSearchParams({
          To: formattedPhone,
          Channel: "sms"
        }).toString()
      });
    } else if (action === "verify") {
      // Verify the code
      if (!verificationCode) {
        return new Response(JSON.stringify({
          success: false,
          message: "Verification code is required"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      // Verify the code
      response = await fetch(`${TWILIO_API_ENDPOINT}/${TWILIO_SERVICE_SID}/VerificationCheck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`
        },
        body: new URLSearchParams({
          To: formattedPhone,
          Code: verificationCode
        }).toString()
      });
      // If verification was successful and invitation ID was provided, update the database
      const responseData = await response.json();
      if (responseData.status === "approved" && invitationId) {
        // Get Supabase client using service role key
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
          auth: {
            persistSession: false
          }
        });
        // Update the invitation with verified status
        const { error } = await supabaseAdmin.from('creator_invitations').update({
          phone_verified: true
        }).eq('id', invitationId);
        if (error) {
          console.error("Error updating invitation:", error);
        }
      }
      return new Response(JSON.stringify({
        success: responseData.status === "approved",
        message: responseData.status === "approved" ? "Phone verified successfully" : "Invalid verification code",
        data: responseData
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid action"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const responseData = await response.json();
    return new Response(JSON.stringify({
      success: true,
      message: action === "send" ? "Verification code sent" : "Verification successful",
      data: responseData
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in verify-phone edge function:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Server error occurred",
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
// Missing import for createClient
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
