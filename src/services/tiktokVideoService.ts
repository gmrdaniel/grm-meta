
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
  // Verificar que video_id no sea nulo
  if (!video.video_id) {
    throw new Error('El campo video_id es obligatorio');
  }
  
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
 * Delete TikTok video by ID
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
 * Link a creator to existing videos
 */
export const linkCreatorToVideos = async (
  creatorId: string, 
  videoIds: string[]
): Promise<void> => {
  // Verificar que ningún videoId sea nulo
  if (videoIds.some(id => !id)) {
    throw new Error('Todos los IDs de video deben ser válidos');
  }
  
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

/**
 * Fetch TikTok user information using RapidAPI
 */
export const fetchTikTokUserInfo = async (username: string): Promise<any> => {
  try {
    const url = `https://tiktok-api6.p.rapidapi.com/user/info?username=${encodeURIComponent(username)}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    throw error;
  }
};

/**
 * Update creator's TikTok information
 */
export const updateCreatorTikTokInfo = async (
  creatorId: string, 
  followerCount: number,
  secUid?: string
): Promise<void> => {
  const isEligible = followerCount >= 100000;
  
  const updateData: {
    seguidores_tiktok: number;
    elegible_tiktok: boolean;
    secuid_tiktok?: string;
  } = {
    seguidores_tiktok: followerCount,
    elegible_tiktok: isEligible
  };
  
  if (secUid) {
    updateData.secuid_tiktok = secUid;
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
 * Fetch TikTok user videos and save them to the database
 */
export const fetchTikTokUserVideos = async (
  username: string,
  creatorId: string,
  limit: number = 10
): Promise<{ savedCount: number, totalCount: number }> => {
  try {
    const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}&limit=${limit}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
        'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.videos || !Array.isArray(data.videos)) {
      throw new Error('Invalid response format from TikTok API');
    }
    
    const videos = data.videos;
    let savedCount = 0;
    
    for (const video of videos) {
      try {
        // Verificar que video.id no sea nulo
        if (!video.id) {
          console.error('Video sin ID encontrado, saltando:', video);
          continue;
        }
        
        const videoData = {
          creator_id: creatorId,
          video_id: video.id,
          description: video.description || '',
          create_time: video.createTime || Math.floor(Date.now() / 1000),
          author: username || '',
          author_id: video.authorId || '',
          video_definition: video.definition || 'unknown',
          duration: video.duration || 0,
          number_of_comments: video.commentCount || 0,
          number_of_hearts: video.likesCount || 0,
          number_of_plays: video.playCount || 0,
          number_of_reposts: video.shareCount || 0
        };
        
        // Verificar todos los campos antes de intentar insertar
        console.log('Intentando guardar video con datos:', videoData);
        
        const { error } = await supabase
          .from('tiktok_video')
          .upsert(videoData, {
            onConflict: 'video_id'
          });
          
        if (error) {
          console.error('Error guardando video en la base de datos:', error);
        } else {
          savedCount++;
        }
      } catch (err) {
        console.error('Error guardando video individual:', err);
      }
    }
    
    return {
      savedCount,
      totalCount: videos.length
    };
  } catch (error) {
    console.error('Error fetching TikTok user videos:', error);
    throw error;
  }
};
