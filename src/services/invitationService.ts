
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation, CreateInvitationData } from "@/types/invitation";

/**
 * Fetch an invitation by its code
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  try {
    console.log('invitationService - fetchInvitationByCode - Input code:', code);
    
    // Method 1: Use custom function that handles multiple matching strategies
    const { data, error } = await findInvitationByCode(code);
    
    console.log('invitationService - fetchInvitationByCode - Result from findInvitationByCode:', { data, error });
    
    if (error) {
      console.error('Error using findInvitationByCode:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      const invitation = data[0] as unknown as CreatorInvitation;
      console.log('invitationService - fetchInvitationByCode - Found invitation:', invitation);
      return invitation;
    }
    
    // Method 2: Try direct exact match query
    const { data: exactData, error: exactError } = await supabase
      .from('creator_invitations')
      .select('*')
      .eq('invitation_code', code)
      .maybeSingle();
      
    console.log('invitationService - fetchInvitationByCode - Direct query result:', { data: exactData, error: exactError });
    
    if (exactError) {
      console.error('Error in direct query:', exactError);
      throw exactError;
    }
    
    if (exactData) {
      console.log('invitationService - fetchInvitationByCode - Found invitation with direct query:', exactData);
      return exactData as CreatorInvitation;
    }
    
    // Method 3: Try with case-insensitive match
    const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
      .from('creator_invitations')
      .select('*')
      .ilike('invitation_code', code)
      .maybeSingle();
      
    console.log('invitationService - fetchInvitationByCode - Case-insensitive query result:', { 
      data: caseInsensitiveData, 
      error: caseInsensitiveError 
    });
    
    if (caseInsensitiveError) {
      console.error('Error in case-insensitive query:', caseInsensitiveError);
      throw caseInsensitiveError;
    }
    
    if (caseInsensitiveData) {
      console.log('invitationService - fetchInvitationByCode - Found invitation with case-insensitive query:', caseInsensitiveData);
      return caseInsensitiveData as CreatorInvitation;
    }

    console.log('invitationService - fetchInvitationByCode - No invitation found with code:', code);
    return null;
  } catch (error) {
    console.error('Error in fetchInvitationByCode:', error);
    throw error;
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
    status: 'pending' as const
  };
  
  const { data, error } = await supabase
    .from('creator_invitations')
    .insert(completeInvitation)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error(error.message);
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
    .single();
  
  if (error) {
    console.error('Error updating invitation status:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation;
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
