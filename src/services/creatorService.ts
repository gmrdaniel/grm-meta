
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

    // Filter by email
    if (filters.email) {
      query = query.ilike('correo', `%${filters.email}%`);
    }

    // Filter by date range
    if (filters.dateFrom) {
      query = query.gte('fecha_creacion', `${filters.dateFrom}T00:00:00`);
    }

    if (filters.dateTo) {
      query = query.lte('fecha_creacion', `${filters.dateTo}T23:59:59`);
    }
    
    // Handle withVideos and withoutVideos filters after getting the initial results
    // We'll process these separately
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
  
  // Special handling for video-related filters
  if ((filters?.withoutVideos || filters?.withVideos) && filteredData.length > 0) {
    // Get the creator IDs from the current result set
    const creatorIds = filteredData.map(creator => creator.id);
    
    // Find which of these creators have videos
    const { data: videoCountData } = await supabase
      .from('tiktok_video')
      .select('creator_id')
      .in('creator_id', creatorIds);
    
    if (videoCountData) {
      // Create a Set of creator IDs that have videos
      const creatorsWithVideos = new Set(videoCountData.map(item => item.creator_id));
      
      // Filter based on whether we want creators with or without videos
      if (filters?.withoutVideos) {
        filteredData = filteredData.filter(creator => !creatorsWithVideos.has(creator.id));
      } else if (filters?.withVideos) {
        filteredData = filteredData.filter(creator => creatorsWithVideos.has(creator.id));
      }
      
      filteredCount = filteredData.length;
    }
  }
  
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
