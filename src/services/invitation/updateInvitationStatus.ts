
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

type InvitationStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Update the status of an invitation
 */
export const updateInvitationStatus = async (
  invitationId: string, 
  status: InvitationStatus
): Promise<CreatorInvitation | null> => {
  try {
    console.log(`Updating invitation ${invitationId} status to: ${status}`);
    
    const { data, error } = await supabase
      .from('creator_invitations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating invitation status:', error);
      throw new Error(error.message);
    }
    
    console.log('Invitation status updated successfully:', data);
    return data as CreatorInvitation;
  } catch (err) {
    console.error('Unexpected error in updateInvitationStatus:', err);
    throw err;
  }
};
