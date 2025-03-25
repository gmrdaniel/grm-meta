
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
 * Fetch TikTok videos for a user using the TikTok API and persist them in the database
 */
export const fetchTikTokUserVideos = async (creatorId: string, username: string): Promise<any> => {
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
    
    // Persist each video in the database
    const savedVideos = [];
    let totalEngagement = 0;
    let totalVideos = 0;
    
    if (responseData?.videos && responseData.videos.length > 0) {
      console.log(`Found ${responseData.videos.length} videos to persist`);
      
      for (const video of responseData.videos) {
        try {
          // Check if video already exists to avoid duplicates
          const { data: existingVideo } = await supabase
            .from('tiktok_video')
            .select('id')
            .eq('video_id', video.id)
            .eq('creator_id', creatorId)
            .single();
          
          if (existingVideo) {
            console.log(`Video ${video.id} already exists, skipping`);
            continue;
          }
          
          const videoData = {
            creator_id: creatorId,
            video_id: video.id,
            description: video.description || '',
            create_time: video.createTime,
            author: username,
            author_id: video.authorId || '',
            video_definition: video.definition || 'unknown',
            duration: video.duration || 0,
            number_of_comments: video.commentCount || 0,
            number_of_hearts: video.diggCount || 0,
            number_of_plays: video.playCount || 0,
            number_of_reposts: video.shareCount || 0
          };
          
          const savedVideo = await addTikTokVideo(videoData);
          savedVideos.push(savedVideo);
          
          // Calculate engagement metrics
          if (video.playCount > 0) {
            const videoEngagement = ((video.diggCount + video.commentCount + video.shareCount) / video.playCount) * 100;
            totalEngagement += videoEngagement;
            totalVideos++;
          }
        } catch (error) {
          console.error('Error saving video:', error);
        }
      }
      
      // Calculate average engagement and update creator profile
      if (totalVideos > 0) {
        const averageEngagement = totalEngagement / totalVideos;
        console.log(`Average engagement rate: ${averageEngagement.toFixed(2)}%`);
        
        // Update the creator's engagement rate
        const { error: updateError } = await supabase
          .from('inventario_creadores')
          .update({ engagement_tiktok: averageEngagement })
          .eq('id', creatorId);
        
        if (updateError) {
          console.error('Error updating creator engagement rate:', updateError);
        }
      }
    }
    
    return {
      videos: responseData.videos,
      savedCount: savedVideos.length,
      totalCount: responseData.videos ? responseData.videos.length : 0,
      engagement: totalVideos > 0 ? (totalEngagement / totalVideos) : 0
    };
  } catch (error) {
    console.error('Error fetching and persisting TikTok user videos:', error);
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
    updateData.secuid_tiktok = secUid;
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
