
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

/**
 * Update the Facebook page information for an invitation
 */
export const updateFacebookPage = async (
  invitationId: string, 
  facebookPageUrl: string
): Promise<CreatorInvitation | null> => {
  try {
    console.log(`Updating Facebook page for invitation ${invitationId} with URL: ${facebookPageUrl}`);
    
    const { data, error } = await supabase
      .from('creator_invitations')
      .update({
        facebook_page: facebookPageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating Facebook page:', error);
      throw new Error(error.message);
    }
    
    console.log('Facebook page updated successfully:', data);
    return data as CreatorInvitation;
  } catch (err) {
    console.error('Unexpected error in updateFacebookPage:', err);
    throw err;
  }
};
