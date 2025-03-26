
import { supabase } from "@/integrations/supabase/client";

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
