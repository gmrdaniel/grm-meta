
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation, CreateInvitationData, UpdateFacebookPageData } from "@/types/invitation";

/**
 * Fetch a single invitation by its code
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  try {
    // Use the RPC function to find invitation by code (fuzzy matching)
    const { data, error } = await findInvitationByCode(code);
    
    if (error) {
      console.error('Error fetching invitation by code:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      return data[0] as unknown as CreatorInvitation;
    }
    
    return null;
  } catch (err) {
    console.error('Unexpected error in fetchInvitationByCode:', err);
    return null;
  }
};

/**
 * Fetch a single invitation by ID
 */
export const fetchInvitationById = async (id: string): Promise<CreatorInvitation | null> => {
  try {
    console.log(`Fetching invitation with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('creator_invitations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching invitation by ID:', error);
      return null;
    }
    
    return data as CreatorInvitation | null;
  } catch (err) {
    console.error('Unexpected error in fetchInvitationById:', err);
    return null;
  }
};

/**
 * Fetch all invitations
 */
export const fetchInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invitations:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation[];
};

/**
 * Generate a unique invitation code
 */
const generateInvitationCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters I,1,O,0
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Create a new invitation
 */
export const createInvitation = async (invitationData: CreateInvitationData): Promise<CreatorInvitation> => {
  // Generate a unique invitation code
  const invitationCode = generateInvitationCode();
  
  // Generate invitation URL path
  const invitationUrl = `/invite/${invitationCode}`;
  
  // Prepare the complete invitation data
  const completeInvitation = {
    ...invitationData,
    invitation_code: invitationCode,
    invitation_url: invitationUrl,
    status: 'pending' as 'pending' // Fix: Use type literal instead of type assertion
  };
  
  const { data, error } = await supabase
    .from('creator_invitations')
    .insert(completeInvitation)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Failed to create invitation: No data returned');
  }
  
  return data as CreatorInvitation;
};

/**
 * Update invitation status
 */
export const updateInvitationStatus = async (
  id: string, 
  status: CreatorInvitation['status']
): Promise<CreatorInvitation> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();  // Changed from .single() to .maybeSingle()
  
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
  facebookPageUrl: string
): Promise<CreatorInvitation | null> => {
  try {
    // Log details for debugging
    console.log('------- UPDATE FACEBOOK PAGE -------');
    console.log(`Updating Facebook page for invitation ID: ${invitationId}`);
    console.log(`Facebook page URL: ${facebookPageUrl}`);
    
    // Verify the invitation exists before updating
    const invitation = await fetchInvitationById(invitationId);
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
        updated_at: new Date().toISOString()
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

/**
 * Delete an invitation
 */
export const deleteInvitation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('creator_invitations')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting invitation:', error);
    throw new Error(error.message);
  }
};
