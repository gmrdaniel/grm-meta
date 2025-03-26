
import { supabase } from "@/integrations/supabase/client";
import { createTask } from "../tasksService";

type InvitationStatus = 'pending' | 'accepted' | 'rejected';

interface InvitationUpdateData {
  id: string;
  status?: InvitationStatus;
  phone_verified?: boolean;
  phone_number?: string;
  phone_country_code?: string;
  instagram_user?: string;
  youtube_channel?: string;
  facebook_page?: string;
}

/**
 * Update an invitation with new data
 */
export const updateInvitation = async (data: InvitationUpdateData) => {
  const { id, ...updateData } = data;
  
  // Start a transaction to update the invitation and potentially create a task
  const { data: invitation, error } = await supabase
    .from('creator_invitations')
    .update(updateData)
    .eq('id', id)
    .select('*, projects:project_id(id, name)')
    .single();
  
  if (error) {
    console.error('Error updating invitation:', error);
    throw new Error(error.message);
  }
  
  // If invitation status is changed to 'accepted', create a validation task
  if (updateData.status === 'accepted') {
    try {
      // First, check if a task already exists for this invitation
      const hasExistingTask = await checkExistingTaskForInvitation(id);
      
      if (!hasExistingTask && invitation.project_id) {
        // Get the appropriate stage for the validation task
        const { data: stages, error: stageError } = await supabase
          .from("project_stages")
          .select("id")
          .eq("project_id", invitation.project_id)
          .eq("view", "meta/FbCreation")
          .limit(1);
        
        if (stageError) {
          console.error('Error finding stage for validation task:', stageError);
        } else if (stages && stages.length > 0) {
          // Create the validation task
          await createTask({
            title: "Validar registro",
            project_id: invitation.project_id,
            stage_id: stages[0].id,
            creator_invitation_id: id
          });
        }
      }
    } catch (taskError) {
      console.error('Error creating validation task:', taskError);
      // We don't throw here because the invitation update was successful
    }
  }
  
  return invitation;
};

/**
 * Check if a task already exists for an invitation
 */
async function checkExistingTaskForInvitation(invitationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("creator_invitation_id", invitationId);
  
  if (error) {
    console.error('Error checking for existing task:', error);
    throw new Error(error.message);
  }
  
  return data && data.length > 0;
}
