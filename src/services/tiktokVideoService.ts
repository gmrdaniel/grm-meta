
import { supabase } from "@/integrations/supabase/client";
import { TikTokVideo } from "@/types/creator";

/**
 * Fetch TikTok videos for a specific creator
 */
export const fetchTikTokVideos = async (
  creatorId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: TikTokVideo[], count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('tiktok_video')
    .select('*', { count: 'exact' })
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching TikTok videos:', error);
    throw new Error(error.message);
  }
  
  return { 
    data: data as TikTokVideo[], 
    count: count || 0 
  };
};

/**
 * Add new TikTok video data
 */
export const addTikTokVideo = async (video: Omit<TikTokVideo, 'id' | 'created_at' | 'updated_at'>): Promise<TikTokVideo> => {
  const { data, error } = await supabase
    .from('tiktok_video')
    .insert(video)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding TikTok video:', error);
    throw new Error(error.message);
  }
  
  return data as TikTokVideo;
};

/**
 * Link a creator to existing videos
 */
export const linkCreatorToVideos = async (
  creatorId: string, 
  videoIds: string[]
): Promise<void> => {
  const updates = videoIds.map(videoId => ({
    creator_id: creatorId,
    video_id: videoId,
  }));
  
  const { error } = await supabase
    .from('tiktok_video')
    .upsert(updates, {
      onConflict: 'video_id',
    });
  
  if (error) {
    console.error('Error linking creator to videos:', error);
    throw new Error(error.message);
  }
};

/**
 * Fetch TikTok videos with creator information
 */
export const fetchTikTokVideosWithCreator = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: (TikTokVideo & { creator: { nombre: string, apellido: string } })[], count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('tiktok_video')
    .select(`
      *,
      creator:creator_id(nombre, apellido)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching TikTok videos with creator:', error);
    throw new Error(error.message);
  }
  
  return { 
    data: data as (TikTokVideo & { creator: { nombre: string, apellido: string } })[], 
    count: count || 0 
  };
};
