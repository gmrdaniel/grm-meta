
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
    console.log('Fetching TikTok info for:', username);
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
    
    const responseData = await response.json();
    console.log('TikTok API response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    throw error;
  }
};

/**
 * Fetch TikTok videos for a user using the TikTok API and persist them
 */
export const fetchTikTokUserVideos = async (username: string, creatorId: string): Promise<any> => {
  try {
    console.log('Fetching TikTok videos for:', username);
    const response = await fetch(`https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'X-RapidAPI-Host': 'tiktok-api6.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('TikTok Video API response:', responseData);
    
    // Check if we have valid video data
    if (!responseData.videos || !Array.isArray(responseData.videos) || responseData.videos.length === 0) {
      console.warn('No videos found for user:', username);
      return { savedCount: 0, totalCount: 0 };
    }
    
    // Process and save videos
    const videos = responseData.videos;
    let savedCount = 0;
    
    for (const video of videos) {
      try {
        // Check if this video already exists in the database
        const { data: existingVideo } = await supabase
          .from('tiktok_video')
          .select('id')
          .eq('video_id', video.video_id || '')
          .eq('creator_id', creatorId)
          .maybeSingle();
        
        if (existingVideo) {
          console.log(`Video ${video.video_id} already exists, skipping`);
          continue;
        }
        
        // Map video data to database schema
        const videoData: Omit<TikTokVideo, 'id' | 'created_at' | 'updated_at'> = {
          creator_id: creatorId,
          video_id: video.video_id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Fallback ID if missing
          description: video.description || '',
          create_time: video.create_time || Math.floor(Date.now() / 1000),
          author: username,
          author_id: video.author_id || '',
          video_definition: video.video_definition || 'unknown',
          duration: video.duration || 0,
          number_of_comments: video.statistics?.comment_count || video.statistics?.number_of_comments || 0,
          number_of_hearts: video.statistics?.digg_count || video.statistics?.number_of_hearts || 0,
          number_of_plays: video.statistics?.play_count || video.statistics?.number_of_plays || 0,
          number_of_reposts: video.statistics?.share_count || video.statistics?.number_of_reposts || 0
        };
        
        await addTikTokVideo(videoData);
        savedCount++;
      } catch (error) {
        console.error(`Error saving video:`, error);
      }
    }
    
    console.log(`Saved ${savedCount} videos out of ${videos.length}`);
    return { savedCount, totalCount: videos.length };
  } catch (error) {
    console.error('Error fetching TikTok user videos:', error);
    throw error;
  }
};

/**
 * Update creator's TikTok follower count and eligibility status
 */
export const updateCreatorTikTokInfo = async (
  creatorId: string, 
  followerCount: number, 
  secUid?: string,
  engagementRate?: number | null
): Promise<void> => {
  // Determine eligibility based on follower count
  const isEligible = followerCount >= 100000;
  
  console.log(`Updating creator ${creatorId} with follower count: ${followerCount}, eligible: ${isEligible}, secUid: ${secUid || 'not provided'}, engagement: ${engagementRate || 'not calculated'}`);
  
  const updateData: Record<string, any> = { 
    seguidores_tiktok: followerCount,
    elegible_tiktok: isEligible
  };
  
  // Only include secUid in the update if it's provided
  if (secUid) {
    updateData.secuid_tiktok = secUid;
  }
  
  // Only include engagement rate in the update if it's provided
  if (engagementRate !== undefined && engagementRate !== null) {
    updateData.engagement_tiktok = engagementRate;
  }
  
  const { error } = await supabase
    .from('creator_inventory')
    .update(updateData)
    .eq('id', creatorId);
  
  if (error) {
    console.error('Error updating creator TikTok info:', error);
    throw new Error(error.message);
  }
};

/**
 * Update creator's TikTok follower count (legacy function, kept for compatibility)
 */
export const updateCreatorTikTokFollowers = async (creatorId: string, followerCount: number): Promise<void> => {
  return updateCreatorTikTokInfo(creatorId, followerCount);
};
