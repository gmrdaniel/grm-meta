
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Save a YouTube Short to the database
 */
export const saveYouTubeShort = async (
  creatorId: string,
  videoData: any
): Promise<boolean> => {
  try {
    if (!videoData || !creatorId || !videoData.videoId) {
      console.error("Invalid video data for saving YouTube Short:", videoData);
      return false;
    }

    // Extract relevant data from the video details
    const { 
      videoId,
      title = null,
      stats = {},
      lengthSeconds = null,
      publishDate = null
    } = videoData;

    // Format the URL
    const url = videoId ? `https://www.youtube.com/shorts/${videoId}` : null;
    
    // Format the video data for database insertion
    const videoRecord = {
      creator_id: creatorId,
      video_id: videoId,
      title: title,
      comments: stats.comments || null,
      likes: stats.likes || null,
      views: stats.views || null,
      duration: lengthSeconds || null,
      url: url,
      published_date: publishDate ? new Date(publishDate).toISOString() : null
    };

    console.log('Saving YouTube Short:', videoRecord);

    // Insert the video record into the database using type assertion to bypass TypeScript error
    const { data, error } = await (supabase
      .from('youtube_shorts' as any)
      .upsert(videoRecord, { 
        onConflict: 'creator_id,video_id',
        ignoreDuplicates: false 
      })
      .select());

    if (error) {
      console.error('Error saving YouTube Short:', error);
      return false;
    }

    console.log('YouTube Short saved successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in saveYouTubeShort:', error);
    return false;
  }
};

/**
 * Batch save multiple YouTube Shorts for a creator
 */
export const batchSaveYouTubeShorts = async (
  creatorId: string, 
  videosData: any[]
): Promise<{ totalVideos: number, savedCount: number }> => {
  try {
    if (!Array.isArray(videosData) || videosData.length === 0 || !creatorId) {
      console.error("Invalid videos data for batch save:", { creatorId, videosDataLength: videosData?.length });
      return { totalVideos: 0, savedCount: 0 };
    }

    let savedCount = 0;
    const totalVideos = videosData.length;
    
    console.log(`Starting batch save of ${totalVideos} YouTube Shorts for creator ID: ${creatorId}`);

    // Process videos in batches to avoid overwhelming the database
    const batchSize = 10;
    
    for (let i = 0; i < videosData.length; i += batchSize) {
      const batch = videosData.slice(i, i + batchSize);
      
      // Format all videos in the batch
      const videoRecords = batch.map(video => {
        if (!video || !video.videoId) return null;
        
        return {
          creator_id: creatorId,
          video_id: video.videoId,
          title: video.title || null,
          comments: video.stats?.comments || null,
          likes: video.stats?.likes || null,
          views: video.stats?.views || null,
          duration: video.lengthSeconds || null,
          url: `https://www.youtube.com/shorts/${video.videoId}`,
          published_date: video.publishDate ? new Date(video.publishDate).toISOString() : null
        };
      }).filter(record => record !== null); // Remove null records
      
      if (videoRecords.length === 0) continue;
      
      // Insert the batch of video records using type assertion to bypass TypeScript error
      const { data, error } = await (supabase
        .from('youtube_shorts' as any)
        .upsert(videoRecords, {
          onConflict: 'creator_id,video_id',
          ignoreDuplicates: false
        }));
      
      if (error) {
        console.error(`Error saving batch ${i / batchSize + 1}:`, error);
      } else {
        savedCount += videoRecords.length;
        console.log(`Saved batch ${i / batchSize + 1}, ${savedCount}/${totalVideos} videos saved so far`);
      }
    }

    // Update the creator's record with the download date
    await supabase
      .from('creator_inventory')
      .update({
        fecha_descarga_yt: new Date().toISOString()
      })
      .eq('id', creatorId);
    
    console.log(`Batch save completed. Saved ${savedCount}/${totalVideos} YouTube Shorts`);
    return { totalVideos, savedCount };
  } catch (error) {
    console.error('Error in batchSaveYouTubeShorts:', error);
    return { totalVideos: 0, savedCount: 0 };
  }
};

/**
 * Fetch YouTube Shorts for a specific creator
 */
export const fetchYouTubeShorts = async (creatorId: string) => {
  try {
    // Use type assertion to bypass TypeScript error
    const { data, error, count } = await (supabase
      .from('youtube_shorts' as any)
      .select('*', { count: 'exact' })
      .eq('creator_id', creatorId)
      .order('published_date', { ascending: false })) as any;
    
    if (error) {
      throw error;
    }
    
    return {
      data,
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching YouTube shorts:', error);
    throw error;
  }
};
