import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { toast } from "sonner";
import { batchSaveYouTubeShorts } from "./youtubeShortsService";

/**
 * Fetch YouTube channel details from RapidAPI
 */
export const fetchYouTubeChannelInfo = async (channelId: string): Promise<any> => {
  try {
    console.log('Fetching YouTube channel info for:', channelId);
    const response = await fetch(`https://youtube-data8.p.rapidapi.com/channel/details/?id=${channelId}&hl=en&gl=US`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'x-rapidapi-host': 'youtube-data8.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching YouTube data: ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube API raw response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching YouTube channel info:', error);
    throw error;
  }
};

/**
 * Update YouTube info for a specific creator
 */
export const updateCreatorYouTubeInfo = async (
  creatorId: string, 
  subscriberCount: number,
  viewCount: number,
  engagementRate: number
): Promise<Creator> => {
  console.log('Updating creator YouTube info:', { creatorId, subscriberCount, viewCount, engagementRate });
  
  // Calculate eligibility - creators with 100k+ subscribers are eligible
  const isEligible = subscriberCount >= 100000;
  
  // Update the creator record with YouTube stats
  const { data, error } = await supabase
    .from('creator_inventory')
    .update({
      seguidores_youtube: subscriberCount,
      views_youtube: viewCount,
      engagement_youtube: engagementRate,
      elegible_youtube: isEligible,
      fecha_descarga_yt: new Date().toISOString()
    })
    .eq('id', creatorId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating creator YouTube info:', error);
    throw new Error(error.message);
  }
  
  console.log('Creator YouTube info updated successfully:', data);
  return data as Creator;
};

/**
 * Fetch YouTube info for a creator and update their record
 */
export const fetchAndUpdateYouTubeInfo = async (
  creatorId: string,
  channelId: string
): Promise<{ subscriberCount: number, viewCount: number, engagementRate: number, isEligible: boolean }> => {
  try {
    console.log('Starting fetchAndUpdateYouTubeInfo for creator:', creatorId, 'channelId:', channelId);
    
    // Fetch channel info from YouTube API
    const channelInfo = await fetchYouTubeChannelInfo(channelId);
    console.log('YouTube channel info response:', channelInfo);
    
    // Extract subscriber and view count
    const subscriberCount = channelInfo.stats?.subscribers;
    const viewCount = channelInfo.stats?.views;
    console.log('YouTube subscriberCount:', subscriberCount);
    console.log('YouTube viewCount:', viewCount);
    
    if (!subscriberCount && subscriberCount !== 0) {
      throw new Error('Could not retrieve subscriber count from YouTube API');
    }
    
    // Calculate engagement rate as views divided by subscribers
    // Avoid division by zero by checking if subscriberCount is zero
    const engagementRate = subscriberCount > 0 ? (viewCount / subscriberCount) : 0;
    console.log('YouTube engagementRate:', engagementRate);
    
    // Calculate eligibility
    const isEligible = subscriberCount >= 100000;
    
    // Update creator record with all YouTube metrics
    await updateCreatorYouTubeInfo(creatorId, subscriberCount, viewCount, engagementRate);
    
    return {
      subscriberCount,
      viewCount,
      engagementRate,
      isEligible
    };
  } catch (error) {
    console.error('Error in fetchAndUpdateYouTubeInfo:', error);
    throw error;
  }
};

/**
 * Fetch YouTube shorts for a creator and save them to the database
 */
export const fetchAndSaveYouTubeShorts = async (
  creatorId: string,
  channelId: string
): Promise<{ totalVideos: number, savedCount: number }> => {
  try {
    console.log('Fetching YouTube shorts for creator:', creatorId, 'channelId:', channelId);
    
    // Fetch shorts from YouTube API
    const response = await fetch(`https://youtube-data8.p.rapidapi.com/channel/videos/?id=${channelId}&filter=shorts_latest&hl=en&gl=US`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'x-rapidapi-host': 'youtube-data8.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching YouTube shorts: ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube shorts API response:', data);
    
    if (!data.contents || data.contents.length === 0) {
      console.log('No YouTube shorts found for this channel');
      return { totalVideos: 0, savedCount: 0 };
    }
    
    // Fetch details for each short
    const videoDetails = [];
    for (const short of data.contents) {
      const videoId = short.video?.videoId;
      if (!videoId) continue;
      
      try {
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const detailsResponse = await fetch(`https://youtube-data8.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
            'x-rapidapi-host': 'youtube-data8.p.rapidapi.com'
          }
        });
        
        if (!detailsResponse.ok) {
          console.error(`Error fetching details for video ${videoId}: ${detailsResponse.status}`);
          continue;
        }
        
        const detailsData = await detailsResponse.json();
        
        videoDetails.push({
          videoId,
          title: detailsData.title,
          stats: detailsData.stats,
          lengthSeconds: detailsData.lengthSeconds,
          publishDate: detailsData.publishDate
        });
      } catch (err) {
        console.error(`Error fetching details for video ${videoId}:`, err);
      }
    }
    
    console.log(`Fetched details for ${videoDetails.length} videos`);
    
    // Save videos to database
    if (videoDetails.length === 0) {
      return { totalVideos: data.contents.length, savedCount: 0 };
    }
    
    const result = await batchSaveYouTubeShorts(creatorId, videoDetails);
    
    return result;
  } catch (error) {
    console.error('Error in fetchAndSaveYouTubeShorts:', error);
    throw error;
  }
};

/**
 * Batch update YouTube info for multiple creators
 */
export const batchUpdateYouTubeInfo = async (
  creators: Creator[]
): Promise<{ 
  totalProcessed: number, 
  successful: number, 
  failed: number 
}> => {
  let successful = 0;
  let failed = 0;
  
  console.log(`Starting batch update of YouTube info for ${creators.length} creators`);
  
  for (const creator of creators) {
    if (!creator.usuario_youtube) continue;
    
    try {
      console.log(`Processing YouTube info for creator ${creator.id} (${creator.usuario_youtube})`);
      await fetchAndUpdateYouTubeInfo(creator.id, creator.usuario_youtube);
      successful++;
    } catch (error) {
      console.error(`Error updating YouTube info for creator ${creator.id}:`, error);
      failed++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return {
    totalProcessed: creators.length,
    successful,
    failed
  };
};

/**
 * Batch fetch YouTube shorts for multiple creators
 */
export const batchFetchYouTubeShorts = async (
  creators: Creator[]
): Promise<{ 
  totalProcessed: number, 
  successful: number, 
  failed: number 
}> => {
  let successful = 0;
  let failed = 0;
  
  console.log(`Starting batch fetch of YouTube shorts for ${creators.length} creators`);
  
  for (const creator of creators) {
    if (!creator.usuario_youtube) continue;
    
    try {
      console.log(`Fetching YouTube shorts for creator ${creator.id} (${creator.usuario_youtube})`);
      
      const result = await fetchAndSaveYouTubeShorts(creator.id, creator.usuario_youtube);
      
      if (result.savedCount > 0) {
        successful++;
      } else {
        console.warn(`No shorts saved for creator ${creator.id} (${creator.usuario_youtube})`);
        // Still mark as successful if no videos were found but the API call worked
        successful++;
      }
    } catch (error) {
      console.error(`Error fetching YouTube shorts for creator ${creator.id}:`, error);
      failed++;
    }
    
    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return {
    totalProcessed: creators.length,
    successful,
    failed
  };
};

/**
 * Fetch all creators with YouTube usernames and update their info
 */
export const batchUpdateYouTubeInfo = async (): Promise<{ 
  totalProcessed: number, 
  successful: number, 
  failed: number 
}> => {
  // Get all creators with YouTube usernames that haven't been updated today
  const { data: creators, error } = await supabase
    .from('creator_inventory')
    .select('id, usuario_youtube')
    .not('usuario_youtube', 'is', null)
    .is('fecha_descarga_yt', null);
  
  if (error) {
    console.error('Error fetching creators with YouTube usernames:', error);
    throw new Error(error.message);
  }
  
  if (!creators || creators.length === 0) {
    return { totalProcessed: 0, successful: 0, failed: 0 };
  }
  
  let successful = 0;
  let failed = 0;
  
  // Process each creator
  for (const creator of creators) {
    if (!creator.usuario_youtube) continue;
    
    try {
      await fetchAndUpdateYouTubeInfo(creator.id, creator.usuario_youtube);
      successful++;
    } catch (error) {
      console.error(`Error updating YouTube info for creator ${creator.id}:`, error);
      failed++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return {
    totalProcessed: creators.length,
    successful,
    failed
  };
};
