
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

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
 * Fetch all invitations with pagination support
 */
export const fetchInvitationsWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ data: CreatorInvitation[], count: number }> => {
  try {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // First get the total count
    const { count, error: countError } = await supabase
      .from('creator_invitations')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error fetching invitations count:', countError);
      return { data: [], count: 0 };
    }
    
    // Then fetch the paginated data
    const { data, error } = await supabase
      .from('creator_invitations')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching paginated invitations:', error);
      return { data: [], count: count || 0 };
    }
    
    return { 
      data: data as CreatorInvitation[], 
      count: count || 0 
    };
  } catch (err) {
    console.error('Unexpected error in fetchInvitationsWithPagination:', err);
    return { data: [], count: 0 };
  }
};

/**
 * Fetch all invitations (no pagination, for export)
 */
export const fetchAllInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all invitations:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation[];
};

/**
 * Legacy function for backwards compatibility
 */
export const fetchInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data } = await fetchInvitationsWithPagination(1, 10);
  return data;
};
