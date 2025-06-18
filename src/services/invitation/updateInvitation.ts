
import { supabase } from "@/integrations/supabase/client";
import { CreateInvitationData, CreatorInvitation } from "@/types/invitation";

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
    console.error('Error updating invitation status:', error.message, error.details);
    throw new Error(error.message);
  }

  if (!data) {
    console.warn(`No invitation found with ID: ${id}`);
    throw new Error(`Invitation with ID ${id} not found or no permission`);
  }

  return data as CreatorInvitation;
};


/**
 * Update Facebook page URL
 */
export const updateFacebookPage = async (
  invitationId: string,
  facebookPageUrl: string,
  facebookProfileUrl: string,
  fbProfileId?: string,
  fbProfileOwnerId?: string,
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
    
    console.log(`Found invitation: ${invitation.id} - ${invitation.first_name}`);
    
    // Using the ID for the update which is more reliable
    const { data, error } = await supabase
      .from('creator_invitations')
      .update({ 
        facebook_page: facebookPageUrl,
        facebook_profile: facebookProfileUrl,
        updated_at: new Date().toISOString(),
        fb_step_completed: true,
        fb_profile_id: fbProfileId,
        fb_profile_owner_id: fbProfileOwnerId

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
    
    console.log(`Successfully updated Facebook page for ${data.first_name}`);
    console.log(`New Facebook page URL: ${data.facebook_page}`);
    
    return data as CreatorInvitation;
  } catch (err) {
    console.error('Unexpected error in updateFacebookPage:', err);
    return null;
  }
};

export const updateInvitation = async (
  id: string,
  data: Partial<CreatorInvitation> | Partial<CreateInvitationData>
): Promise<CreatorInvitation> => {
  // 🔒 Bloquear modificación del email
  const { email, project_id, ...safeData } = data;

  const { data: updatedInvitation, error } = await supabase
    .from("creator_invitations")
    .update({
      ...safeData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase update error:", error.message);
    throw new Error("Failed to update invitation");
  }

  return updatedInvitation as CreatorInvitation;
};