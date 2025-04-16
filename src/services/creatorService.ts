import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { CreatorFilter } from "@/components/admin/inventory/creators-list/types";

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
    
    if (filters.hasTikTokUsername) {
      query = query.not('usuario_tiktok', 'is', null);
    }

    if (filters.hasYouTubeUsername) {
      query = query.not('usuario_youtube', 'is', null);
    }

    if (filters.withoutEngagement) {
      query = query.or('engagement_tiktok.is.null,engagement_tiktok.eq.0');
    }
    
    if (filters.withoutVideos) {
      query = query.is('fecha_consulta_videos', null);
    }

    if (filters.withVideos) {
      query = query.not('fecha_consulta_videos', 'is', null);
    }

    if (filters.withoutYouTube) {
      query = query.is('fecha_descarga_yt', null);
    }
    
    if (filters.withoutYouTubeEngagement) {
      query = query.is('engagement_youtube', null);
    }

    if (filters.assignedToUser) {
      if (filters.assignedToUser === 'unassigned') {
        query = query.is('usuario_asignado', null);
      } else {
        query = query.eq('usuario_asignado', filters.assignedToUser);
      }
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

  let filteredData = data as Creator[];
  let filteredCount = count || 0;
  
  return { 
    data: filteredData, 
    count: filteredCount 
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
};

/**
 * Fetch admin users for assignment
 */
export const fetchAdminUsers = async (): Promise<{ id: string; name: string; email: string }[]> => {
  // Return hardcoded list of specific users
  const specificUsers = [
    "DANIEL", "ORIANA", "FRANK", "ANA", 
    "MANUEL", "DAYANA", "KATHERINE", "SAONE"
  ];
  
  return specificUsers.map(name => ({
    id: name,
    name: name,
    email: `${name.toLowerCase()}@example.com` // Placeholder emails
  }));
};

/**
 * Assign a creator to a user
 */
export const assignCreatorToUser = async (creatorId: string, userName: string | null): Promise<void> => {
  console.log(`Assigning creator ${creatorId} to user: ${userName}`);
  
  const { error } = await supabase
    .from('creator_inventory')
    .update({ usuario_asignado: userName })
    .eq('id', creatorId);
  
  if (error) {
    console.error('Error assigning creator to user:', error);
    throw new Error(error.message);
  }
};

/**
 * Batch assign creators to a user
 */
export const batchAssignCreatorsToUser = async (creatorIds: string[], userName: string | null): Promise<void> => {
  // No creators to assign
  if (creatorIds.length === 0) return;
  
  console.log(`Batch assigning ${creatorIds.length} creators to user: ${userName}`);
  
  const { error } = await supabase
    .from('creator_inventory')
    .update({ usuario_asignado: userName })
    .in('id', creatorIds);
  
  if (error) {
    console.error('Error batch assigning creators to user:', error);
    throw new Error(error.message);
  }
};
