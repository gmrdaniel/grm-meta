import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

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
