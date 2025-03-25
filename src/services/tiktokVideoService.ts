
import { supabase } from "@/integrations/supabase/client";
import { TikTokVideo } from "@/types/creator";

/**
 * Fetch TikTok videos for a specific creator
 */
export const fetchTikTokVideos = async (creatorId: string): Promise<TikTokVideo[]> => {
  const { data, error } = await supabase
    .from('tiktok_video')
    .select('*')
    .eq('creator_id', creatorId)
    .order('create_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching TikTok videos:', error);
    throw new Error(error.message);
  }
  
  return data as TikTokVideo[];
};

/**
 * Add a TikTok video for a creator
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
 * Delete a TikTok video
 */
export const deleteTikTokVideo = async (videoId: string): Promise<void> => {
  const { error } = await supabase
    .from('tiktok_video')
    .delete()
    .eq('id', videoId);
  
  if (error) {
    console.error('Error deleting TikTok video:', error);
    throw new Error(error.message);
  }
};

/**
 * Update a TikTok video
 */
export const updateTikTokVideo = async (videoId: string, updates: Partial<TikTokVideo>): Promise<TikTokVideo> => {
  const { data, error } = await supabase
    .from('tiktok_video')
    .update(updates)
    .eq('id', videoId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating TikTok video:', error);
    throw new Error(error.message);
  }
  
  return data as TikTokVideo;
};

/**
 * Fetch TikTok user information using the TikTok API
 */
export const fetchTikTokUserInfo = async (username: string): Promise<any> => {
  try {
    const response = await fetch(`https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    throw error;
  }
};
