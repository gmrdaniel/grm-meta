
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
    
    if (filters.noEngagement) {
      query = query.or('engagement_tiktok.is.null,engagement_tiktok.eq.0');
    }
    
    if (filters.noVideos) {
      // We need to use a different approach for this filter since it involves checking a relationship
      // We'll use a subquery to find creators who don't have any videos
      const creatorIdsWithVideos = await supabase
        .from('tiktok_video')
        .select('creator_id')
        .then(({ data }) => data?.map(record => record.creator_id) || []);
      
      if (creatorIdsWithVideos.length > 0) {
        query = query.not('id', 'in', creatorIdsWithVideos);
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
};
