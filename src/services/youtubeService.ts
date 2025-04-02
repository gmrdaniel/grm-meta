
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { toast } from "sonner";

/**
 * Fetch YouTube channel details from RapidAPI
 */
export const fetchYouTubeChannelInfo = async (channelId: string): Promise<any> => {
  try {
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
  subscriberCount: number
): Promise<Creator> => {
  // Calculate eligibility - creators with 100k+ subscribers are eligible
  const isEligible = subscriberCount >= 100000;
  
  // Update the creator record with YouTube stats
  const { data, error } = await supabase
    .from('creator_inventory')
    .update({
      seguidores_youtube: subscriberCount,
      elegible_youtube: isEligible
    })
    .eq('id', creatorId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating creator YouTube info:', error);
    throw new Error(error.message);
  }
  
  return data as Creator;
};

/**
 * Fetch YouTube info for a creator and update their record
 */
export const fetchAndUpdateYouTubeInfo = async (
  creatorId: string,
  channelId: string
): Promise<{ subscriberCount: number, isEligible: boolean }> => {
  try {
    // Fetch channel info from YouTube API
    const channelInfo = await fetchYouTubeChannelInfo(channelId);
    console.log('YouTube channel info response:', channelInfo);
    
    // Extract subscriber count
    const subscriberCount = channelInfo.stats?.subscribers;
    
    if (!subscriberCount && subscriberCount !== 0) {
      throw new Error('Could not retrieve subscriber count from YouTube API');
    }
    
    // Calculate eligibility
    const isEligible = subscriberCount >= 100000;
    
    // Update creator record
    await updateCreatorYouTubeInfo(creatorId, subscriberCount);
    
    return {
      subscriberCount,
      isEligible
    };
  } catch (error) {
    console.error('Error in fetchAndUpdateYouTubeInfo:', error);
    throw error;
  }
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
