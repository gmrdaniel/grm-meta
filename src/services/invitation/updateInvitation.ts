
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

/**
 * Update invitation status
 */
export const updateInvitationStatus = async (
  id: string, 
  status: 'pending' | 'rejected' | 'completed' | 'in process' | 'sended'
): Promise<CreatorInvitation> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error updating invitation status:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error(`Invitation with ID ${id} not found`);
  }
  
  return data as CreatorInvitation;
};

/**
 * Update Facebook page URL
 */
export const updateFacebookPage = async (
  invitationId: string,
  facebookPageUrl: string,
  facebookProfileUrl: string
): Promise<CreatorInvitation | null> => {
  try {
    // Verify the invitation exists before updating
    const { data: invitation } = await supabase
      .from('creator_invitations')
      .select('*')
      .eq('id', invitationId)
      .maybeSingle();
      
    if (!invitation) {
      console.error(`No invitation found with ID: ${invitationId}`);
      return null;
    }
    
    console.log(`Found invitation: ${invitation.id} - ${invitation.full_name}`);
    
    // Using the ID for the update which is more reliable
    const { data, error } = await supabase
      .from('creator_invitations')
      .update({ 
        facebook_page: facebookPageUrl,
        facebook_profile: facebookProfileUrl,
        updated_at: new Date().toISOString(),
        fb_step_completed: true
      })
      .eq('id', invitationId)
      .select('*')  // Make sure we select all columns
      .maybeSingle();
      
    if (error) {
      console.error('Error updating Facebook page:', error);
      console.error('Error details:', JSON.stringify(error));
      return null;
    }
    
    if (!data) {
      console.error('No data returned after update');
      return null;
    }
    
    console.log(`Successfully updated Facebook page for ${data.full_name}`);
    console.log(`New Facebook page URL: ${data.facebook_page}`);
    
    return data as CreatorInvitation;
  } catch (err) {
    console.error('Unexpected error in updateFacebookPage:', err);
    return null;
  }
};
