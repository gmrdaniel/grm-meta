
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_SERVICE_SID = Deno.env.get("TWILIO_SERVICE_SID");
const TWILIO_API_ENDPOINT = "https://verify.twilio.com/v2/Services";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, phoneNumber, countryCode, verificationCode, invitationId } = await req.json();
    const formattedPhone = `${countryCode}${phoneNumber}`;
    
    // Basic validation
    if (!action || !phoneNumber || !countryCode) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        return new Response(
          JSON.stringify({ success: false, message: "Verification code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          { auth: { persistSession: false } }
        );

        // Get invitation data
        const { data: invitationData, error: invitationError } = await supabaseAdmin
          .from('creator_invitations')
          .select('email, full_name')
          .eq('id', invitationId)
          .single();

        if (invitationError) {
          console.error("Error fetching invitation:", invitationError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Error fetching invitation data",
              error: invitationError.message
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create user and profile
        try {
          // Create auth user with a random password (will use magic link later)
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: invitationData.email,
            password: crypto.randomUUID(),
            email_confirm: true
          });

          if (authError) throw authError;

          // Create profile entry
          if (authData.user) {
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: invitationData.email,
                first_name: invitationData.full_name,
                role: 'creator'
              });

            if (profileError) throw profileError;
          }

          // Update the invitation with verified status
          const { error: updateError } = await supabaseAdmin
            .from('creator_invitations')
            .update({ 
              status: 'completed',
              phone_verified: true,
              phone_number: phoneNumber,
              phone_country_code: countryCode
            })
            .eq('id', invitationId);

          if (updateError) throw updateError;

        } catch (error) {
          console.error("Error in profile creation:", error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Error creating profile",
              error: error.message
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: responseData.status === "approved", 
          message: responseData.status === "approved" ? "Phone verified successfully" : "Invalid verification code",
          data: responseData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responseData = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === "send" ? "Verification code sent" : "Verification successful",
        data: responseData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in verify-phone edge function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Server error occurred", 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
