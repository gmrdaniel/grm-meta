
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";
import { toast } from "sonner";

/**
 * Fetch TikTok details for a creator and update the database
 */
export const fetchAndUpdateTikTokDetails = async (creatorId: string, tiktokUsername: string): Promise<void> => {
  try {
    console.log(`Fetching TikTok details for ${tiktokUsername} (Creator ID: ${creatorId})`);
    
    // Make request to Supabase Edge Function
    const response = await fetch('/api/fetch-tiktok-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: tiktokUsername,
        creatorId
      })
    });

    // First check if response is valid before trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from TikTok API:', errorText);
      throw new Error(`Error from TikTok API: ${errorText || 'Unknown error'}`);
    }
    
    // Try to parse JSON safely
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Failed to parse response from server');
    }

    console.log('TikTok details update response:', result);
    
    toast.success("TikTok details update request was sent successfully. The creator's data will be updated in the background.");

  } catch (error) {
    console.error('Error updating TikTok details:', error);
    toast.error(`Failed to update TikTok details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Check the status of a TikTok details update task
 */
export const checkTikTokUpdateStatus = async (creatorId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  updatedData?: Partial<Creator>;
}> => {
  try {
    const { data, error } = await supabase
      .from('inventario_creadores')
      .select('seguidores_tiktok, engagement_tiktok, elegible_tiktok')
      .eq('id', creatorId)
      .single();
    
    if (error) throw error;
    
    return {
      status: 'completed',
      updatedData: data
    };
  } catch (error) {
    console.error('Error checking TikTok update status:', error);
    return { status: 'failed' };
  }
};
