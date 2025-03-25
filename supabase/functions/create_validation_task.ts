
// This is a Supabase Edge Function that will be called by the trigger
// It creates a validation task when an invitation is accepted but only if one doesn't already exist

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

    // If a task already exists, don't create a new one
    if (existingTasks && existingTasks.length > 0) {
      return new Response(
        JSON.stringify({ message: "Task already exists for this invitation", task_id: existingTasks[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the appropriate stage for the validation task
    const { data: stages, error: stageError } = await supabase
      .from("project_stages")
      .select("id")
      .eq("project_id", invitation.project_id)
      .eq("view", "meta/FbCreation")
      .limit(1);

    if (stageError) {
      throw stageError;
    }

    if (!stages || stages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No appropriate stage found for validation task" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Create the validation task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: "Validar registro",
        project_id: invitation.project_id,
        stage_id: stages[0].id,
        status: "pending",
        creator_invitation_id: invitation.id
      })
      .select()
      .single();

    if (taskError) {
      throw taskError;
    }

    return new Response(
      JSON.stringify({ success: true, task }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create_validation_task function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
