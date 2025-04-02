import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_SERVICE_SID = Deno.env.get('TWILIO_SERVICE_SID');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { action, phoneNumber, code } = await req.json();
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SERVICE_SID) {
      throw new Error('Twilio credentials are not configured');
    }
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    // Send verification code
    if (action === 'send') {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      console.log(`Sending verification code to ${formattedPhoneNumber}`);
      const twilioResponse = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'To': formattedPhoneNumber,
          'Channel': 'sms'
        })
      });
      const twilioData = await twilioResponse.json();
      console.log('Twilio send response:', twilioData);
      if (!twilioResponse.ok) {
        throw new Error(`Failed to send verification code: ${twilioData.message || 'Unknown error'}`);
      }
      return new Response(JSON.stringify({
        success: true,
        status: twilioData.status
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else if (action === 'verify') {
      if (!phoneNumber || !code) {
        throw new Error('Phone number and verification code are required');
      }
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      console.log(`Verifying code ${code} for ${formattedPhoneNumber}`);
      const twilioResponse = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'To': formattedPhoneNumber,
          'Code': code
        })
      });
      const twilioData = await twilioResponse.json();
      console.log('Twilio verify response:', twilioData);
      if (!twilioResponse.ok) {
        throw new Error(`Failed to verify code: ${twilioData.message || 'Unknown error'}`);
      }
      const isValid = twilioData.status === 'approved';
      return new Response(JSON.stringify({
        success: true,
        valid: isValid,
        status: twilioData.status
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      throw new Error('Invalid action. Use "send" or "verify"');
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
