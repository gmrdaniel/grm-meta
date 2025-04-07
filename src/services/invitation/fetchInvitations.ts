
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

/**
 * Fetch a single invitation by its code
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  try {
    // Use the RPC function to find invitation by code (fuzzy matching)
    const { data, error } = await supabase.rpc('find_invitation_by_code', { code_param: code });
    
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
