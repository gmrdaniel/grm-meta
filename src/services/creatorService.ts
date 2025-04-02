
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

    // New filter for creators with YouTube username
    if (filters.hasYouTubeUsername) {
      query = query.not('usuario_youtube', 'is', null);
    }

    // Filter creators without engagement data
    if (filters.withoutEngagement) {
      query = query.or('engagement_tiktok.is.null,engagement_tiktok.eq.0');
    }
    
    // Updated filter to fetch creators where fecha_consulta_videos is null
    if (filters.withoutVideos) {
      query = query.is('fecha_consulta_videos', null);
    }

    // Add filter for creators without YouTube data
    if (filters.withoutYouTube) {
      query = query.is('fecha_descarga_yt', null);
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
