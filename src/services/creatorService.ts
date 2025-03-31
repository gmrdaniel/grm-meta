
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
      // Instead of using a complex subquery, we'll handle this filter separately after fetching creators
      // We'll fetch all creators for now and filter them in-memory
      // In a production app with large datasets, this should be optimized with a proper database query
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
  
  // If we need to filter creators without videos, we'll do it separately
  if (filters?.noVideos) {
    try {
      // Get all creator IDs that have videos
      const { data: videoData } = await supabase
        .from('tiktok_video')
        .select('creator_id')
        .limit(10000);
      
      if (videoData) {
        // Get unique creator IDs that have videos
        const creatorIdsWithVideos = [...new Set(videoData.map(item => item.creator_id))];
        
        // Filter out creators that have videos
        filteredData = filteredData.filter(creator => !creatorIdsWithVideos.includes(creator.id));
      }
    } catch (videoError) {
      console.error('Error fetching video data for filtering:', videoError);
      // Continue with unfiltered data if there's an error with the video filtering
    }
  }
  
  return { 
    data: filteredData, 
    count: filters?.noVideos ? filteredData.length : (count || 0)
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
