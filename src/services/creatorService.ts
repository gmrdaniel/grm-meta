
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { CreatorFilter } from "@/components/admin/inventory/import-templates/types";

/**
 * Fetch creators with pagination and filtering
 */
export const fetchCreators = async (
  page: number = 1, 
  pageSize: number = 10,
  filters?: CreatorFilter
): Promise<{ data: Creator[], count: number }> => {
  let query = supabase
    .from('creator_inventory')
    .select('*', { count: 'exact' });
  
  // Apply filters if provided
  if (filters) {
    if (filters.tiktokEligible) {
      query = query.eq('elegible_tiktok', true);
    }
    
    if (filters.hasTiktokUsername) {
      query = query.not('usuario_tiktok', 'is', null);
    }
  }
  
  // Add pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('fecha_creacion', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching creators:', error);
    throw new Error(error.message);
  }
  
  return { 
    data: data as Creator[], 
    count: count || 0 
  };
};

/**
 * Create a new creator
 */
export const createCreator = async (creator: Omit<Creator, 'id' | 'fecha_creacion'>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('creator_inventory')
    .insert(creator)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating creator:', error);
    throw new Error(error.message);
  }
  
  return data as Creator;
};

/**
 * Update a creator
 */
export const updateCreator = async (id: string, updates: Partial<Creator>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('creator_inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating creator:', error);
    throw new Error(error.message);
  }
  
  return data as Creator;
};

/**
 * Delete a creator
 */
export const deleteCreator = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('creator_inventory')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting creator:', error);
    throw new Error(error.message);
  }
}

export const getProfileIdByInvitationId = async (
  invitationId: string
): Promise<string | null> => {
  // 1. Obtener el email desde la invitación
  const { data: invitation, error: invitationError } = await supabase
    .from("creator_invitations")
    .select("email")
    .eq("id", invitationId)
    .single();

  if (invitationError || !invitation) {
    console.error("Error obteniendo la invitación:", invitationError);
    return null;
  }

  const email = invitation.email;

  // 2. Buscar el perfil por ese email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    console.error("Error obteniendo el perfil:", profileError);
    return null;
  }

  return profile.id;
};
