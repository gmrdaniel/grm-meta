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
 * Sleep utility function to pause execution
 * @param ms Time to sleep in milliseconds
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Adaptive delay function that increases delay time if API rate limits are hit
 * @param baseDelay Base delay in milliseconds
 * @param retryCount Number of retries already attempted
 * @returns Calculated delay time in milliseconds
 */
const getAdaptiveDelay = (baseDelay: number, retryCount: number): number => {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000);
};

/**
 * Fetch TikTok user information using the TikTok API
 * Implements adaptive delays to manage rate limits
 */
export const fetchTikTokUserInfo = async (username: string): Promise<any> => {
  try {
    console.log('Fetching TikTok info for:', username);
    
    let retryCount = 0;
    let success = false;
    let responseData;
    
    while (!success && retryCount < 5) {
      try {
        // Apply a delay before making the request (except for the first attempt)
        if (retryCount > 0) {
          const delayTime = getAdaptiveDelay(1500, retryCount - 1);
          console.log(`Rate limit hit, retrying in ${delayTime}ms (attempt ${retryCount + 1}/5)...`);
          await sleep(delayTime);
        } else {
          // Add a small delay even on first attempt to prevent rapid consecutive requests
          await sleep(500);
        }
        
        const response = await fetch(`https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(username)}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
            'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com'
          }
        });
        
        if (response.status === 429) {
          console.warn('Rate limit exceeded for TikTok user info API, will retry with longer delay');
          retryCount++;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        responseData = await response.json();
        console.log('TikTok API response:', responseData);
        success = true;
      } catch (err) {
        console.error('Error during TikTok API request:', err);
        if (err instanceof Error && (err.message.includes('429') || err.message.includes('rate'))) {
          retryCount++;
          if (retryCount >= 5) {
            throw new Error('Maximum retry attempts reached for rate limiting');
          }
        } else {
          throw err;
        }
      }
    }
    
    if (!responseData) {
      throw new Error('Failed to fetch TikTok user info after multiple attempts');
    }
    
    return responseData;
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    throw error;
  }
};

/**
 * Fetch TikTok videos for a user using the TikTok API and persist them
 * Implements adaptive rate limiting to handle API restrictions
 */
export const fetchTikTokUserVideos = async (username: string, creatorId: string): Promise<any> => {
  try {
    console.log('Fetching TikTok videos for:', username);
    
    let retryCount = 0;
    let success = false;
    let responseData;
    
    while (!success && retryCount < 5) {
      try {
        if (retryCount > 0) {
          const delayTime = getAdaptiveDelay(1500, retryCount - 1);
          console.log(`Rate limit hit, retrying in ${delayTime}ms (attempt ${retryCount + 1}/5)...`);
          await sleep(delayTime);
        }
        
        const response = await fetch(`https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
            'X-RapidAPI-Host': 'tiktok-api6.p.rapidapi.com'
          }
        });
        
        if (response.status === 429) {
          console.warn('Rate limit exceeded, will retry with longer delay');
          retryCount++;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        responseData = await response.json();
        console.log('TikTok Video API response:', responseData);
        success = true;
      } catch (err) {
        if (err instanceof Error && err.message.includes('429')) {
          retryCount++;
          if (retryCount >= 5) {
            throw new Error('Maximum retry attempts reached for rate limiting');
          }
        } else {
          throw err;
        }
      }
    }
    
    if (!responseData) {
      throw new Error('Failed to fetch TikTok videos after multiple attempts');
    }
    
    if (!responseData.videos || !Array.isArray(responseData.videos) || responseData.videos.length === 0) {
      console.warn('No videos found for user:', username);
      return { savedCount: 0, totalCount: 0 };
    }
    
    const videos = responseData.videos;
    let savedCount = 0;
    
    for (const video of videos) {
      try {
        if (savedCount > 0) {
          await sleep(200);
        }
        
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
        
        const videoData: Omit<TikTokVideo, 'id' | 'created_at' | 'updated_at'> = {
          creator_id: creatorId,
          video_id: video.video_id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    
    // Update fecha_consulta_videos after fetching videos
    await supabase
      .from('creator_inventory')
      .update({ fecha_consulta_videos: new Date().toISOString() })
      .eq('id', creatorId);
      
    console.log(`Saved ${savedCount} videos out of ${videos.length} and updated fecha_consulta_videos`);
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
  const isEligible = followerCount >= 100000;
  
  console.log(`Updating creator ${creatorId} with follower count: ${followerCount}, eligible: ${isEligible}, secUid: ${secUid || 'not provided'}, engagement: ${engagementRate || 'not calculated'}`);
  
  const updateData: Record<string, any> = { 
    seguidores_tiktok: followerCount,
    elegible_tiktok: isEligible
  };
  
  if (secUid) {
    updateData.secuid_tiktok = secUid;
  }
  
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

/**
 * Batch update TikTok info for multiple creators
 */
export const batchUpdateTikTokInfo = async (
  creators: Creator[]
): Promise<{
  totalProcessed: number,
  successful: number,
  failed: number
}> => {
  let successful = 0;
  let failed = 0;
  
  console.log(`Starting batch update of TikTok info for ${creators.length} creators`);
  
  for (const creator of creators) {
    if (!creator.usuario_tiktok) continue;
    
    try {
      console.log(`Processing TikTok info for creator ${creator.id} (${creator.usuario_tiktok})`);
      
      const userInfo = await fetchTikTokUserInfo(creator.usuario_tiktok);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      if (followerCount !== undefined) {
        await updateCreatorTikTokInfo(creator.id, followerCount, secUid);
        successful++;
      } else {
        console.error(`No follower count found for creator ${creator.id} (${creator.usuario_tiktok})`);
        failed++;
      }
    } catch (error) {
      console.error(`Error updating TikTok info for creator ${creator.id}:`, error);
      failed++;
    }
    
    // Add a delay to avoid rate limiting
    await sleep(1500);
  }
  
  return {
    totalProcessed: creators.length,
    successful,
    failed
  };
};

/**
 * Batch fetch TikTok videos for multiple creators
 */
export const batchFetchTikTokVideos = async (
  creators: Creator[]
): Promise<{
  totalProcessed: number,
  successful: number,
  failed: number
}> => {
  let successful = 0;
  let failed = 0;
  
  console.log(`Starting batch fetch of TikTok videos for ${creators.length} creators`);
  
  for (const creator of creators) {
    if (!creator.usuario_tiktok) continue;
    
    try {
      console.log(`Fetching TikTok videos for creator ${creator.id} (${creator.usuario_tiktok})`);
      
      const result = await fetchTikTokUserVideos(creator.usuario_tiktok, creator.id);
      
      if (result.savedCount > 0) {
        successful++;
      } else {
        console.warn(`No videos saved for creator ${creator.id} (${creator.usuario_tiktok})`);
        failed++;
      }
    } catch (error) {
      console.error(`Error fetching TikTok videos for creator ${creator.id}:`, error);
      failed++;
    }
    
    // Add a delay to avoid rate limiting
    await sleep(3000);
  }
  
  return {
    totalProcessed: creators.length,
    successful,
    failed
  };
};
