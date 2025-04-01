
// This is a Supabase Edge Function that will be called by the trigger
// It checks if a validation task exists for an invitation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const { invitation } = await req.json();

    if (!invitation || !invitation.id || !invitation.project_id) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if a task already exists for this invitation
    const { data: existingTasks, error: checkError } = await supabase
      .from("tasks")
      .select("id")
      .eq("creator_invitation_id", invitation.id);

    if (checkError) {
      throw checkError;
    }

    // Return information about whether a task exists
    if (existingTasks && existingTasks.length > 0) {
      return new Response(
        JSON.stringify({ taskExists: true, task_id: existingTasks[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ taskExists: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in create_validation_task function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
