import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { CreatorFilter } from "@/components/admin/inventory/creators-list/types";

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
    
    if (filters.hasTikTokUsername) {
      query = query.not('usuario_tiktok', 'is', null);
    }

    // Filter creators without engagement data
    if (filters.withoutEngagement) {
      query = query.or('engagement_tiktok.is.null,engagement_tiktok.eq.0');
    }
    
    // Special handling for withoutVideos filter
    // We'll use a direct query rather than a subquery builder
    if (filters.withoutVideos) {
      // First get all creator IDs that have videos
      const { data: creatorsWithVideos } = await supabase
        .from('tiktok_video')
        .select('creator_id');
      
      // If we have creators with videos, exclude them from the results
      if (creatorsWithVideos && creatorsWithVideos.length > 0) {
        const creatorIdsWithVideos = creatorsWithVideos.map(item => item.creator_id);
        query = query.not('id', 'in', creatorIdsWithVideos);
      }
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('fecha_creacion', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error('Error fetching creators without videos:', error);
        throw new Error(error.message);
      }
      
      return { 
        data: data as Creator[], 
        count: count || 0 
      };
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
 * Helper function to paginate results client-side
 * Used for complex queries where server-side pagination is not possible
 */
const filterPaginated = (data: any[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
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
