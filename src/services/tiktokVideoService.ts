
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
    const response = await fetch(`https://tiktok-api6.p.rapidapi.com/user/info?username=${encodeURIComponent(username)}`, {
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
    console.log('TikTok API response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    throw error;
  }
};

/**
 * Update creator's TikTok follower count and eligibility status
 */
export const updateCreatorTikTokInfo = async (creatorId: string, followerCount: number, secUid?: string): Promise<void> => {
  // Determine eligibility based on follower count
  const isEligible = followerCount >= 100000;
  
  console.log(`Updating creator ${creatorId} with follower count: ${followerCount}, eligible: ${isEligible}, secUid: ${secUid || 'not provided'}`);
  
  const updateData: Record<string, any> = { 
    seguidores_tiktok: followerCount,
    elegible_tiktok: isEligible
  };
  
  // Only include secUid in the update if it's provided
  if (secUid) {
    updateData.secuid_tiktok = secUid; // Consistently using secuid_tiktok
  }
  
  const { error } = await supabase
    .from('inventario_creadores')
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

/**
 * Fetch TikTok posts for a user by username and save them to the database
 */
export const fetchAndSaveTikTokPosts = async (creatorId: string, username: string): Promise<{
  savedCount: number,
  totalVideos: number
}> => {
  if (!username) {
    throw new Error('Username is required to fetch TikTok posts');
  }

  try {
    console.log(`Fetching TikTok posts for creator ${creatorId} with username: ${username}`);
    
    const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'X-RapidAPI-Host': 'tiktok-api6.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('TikTok posts API response:', result);
    
    // Check if the API returned videos properly
    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid API response: No videos found');
    }
    
    // Process and save each video
    let savedCount = 0;
    const totalVideos = result.data.length;
    
    for (const item of result.data) {
      try {
        // Extract relevant video data based on the new API structure
        const videoData = {
          creator_id: creatorId,
          video_id: item.id,
          description: item.desc || '',
          create_time: item.createTime || Math.floor(Date.now() / 1000),
          author: username,
          author_id: item.authorId || '',
          video_definition: 'unknown', // May not be available in new API
          duration: item.video?.duration || 0,
          number_of_comments: item.stats?.commentCount || 0,
          number_of_hearts: item.stats?.diggCount || 0,
          number_of_plays: item.stats?.playCount || 0,
          number_of_reposts: item.stats?.shareCount || 0
        };
        
        console.log('Saving video data:', videoData);
        
        // Check if video already exists
        const { data: existingVideo } = await supabase
          .from('tiktok_video')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('video_id', item.id)
          .maybeSingle();
        
        if (existingVideo) {
          // Update existing video
          await updateTikTokVideo(existingVideo.id, videoData);
        } else {
          // Add new video
          await addTikTokVideo(videoData);
        }
        
        savedCount++;
      } catch (videoError) {
        console.error('Error processing video:', videoError);
        // Continue with the next video
      }
    }
    
    return {
      savedCount,
      totalVideos
    };
    
  } catch (error) {
    console.error('Error fetching and saving TikTok posts:', error);
    throw error;
  }
};
