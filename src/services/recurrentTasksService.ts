
import { supabase } from "@/integrations/supabase/client";
import { RecurrentTask, RecurrentTaskDetail } from "@/types/recurrent-tasks";
import { batchFetchTikTokVideos } from "@/services/tiktokVideoService";
import { Creator } from "@/types/creator";

// Fetch tasks summary for the list
export const fetchTasksToProcess = async (): Promise<{ tasks: RecurrentTask[] }> => {
  // For now, we have a hardcoded list of recurrent tasks
  const tasks: RecurrentTask[] = [
    {
      id: "tiktok-videos",
      name: "Obtener videos TikTok",
      type: "tikTokVideos",
      description: "Descarga videos de TikTok para creadores sin videos en la base de datos",
      lastRunStatus: "pending",
      frequency: "daily",
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  // Get real pending counts for tasks
  const { count } = await supabase
    .from('creator_inventory')
    .select('*', { count: 'exact', head: true })
    .not('usuario_tiktok', 'is', null)
    .is('fecha_consulta_videos', null);

  // Update the pending count
  tasks[0].pendingCount = count || 0;

  return { tasks };
};

// Fetch details for a specific task
export const fetchTaskDetail = async (taskId: string): Promise<RecurrentTaskDetail> => {
  // For now, we have a hardcoded task detail
  if (taskId === "tiktok-videos") {
    const { count } = await supabase
      .from('creator_inventory')
      .select('*', { count: 'exact', head: true })
      .not('usuario_tiktok', 'is', null)
      .is('fecha_consulta_videos', null);

    return {
      id: "tiktok-videos",
      name: "Obtener videos TikTok",
      type: "tikTokVideos",
      description: "Descarga videos de TikTok para creadores sin videos en la base de datos",
      lastRunStatus: "pending",
      frequency: "daily",
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 86400000).toISOString(),
      pendingCount: count || 0,
      configuration: {
        query: "SELECT * FROM creator_inventory WHERE usuario_tiktok is not null AND fecha_consulta_videos is null"
      }
    };
  }

  throw new Error("Task not found");
};

// Type for progress callback
interface TaskExecutionOptions {
  onProgress?: (processed: number, total: number) => void;
}

// Execute a task
export const executeTask = async (
  taskId: string, 
  options?: TaskExecutionOptions
): Promise<void> => {
  if (taskId === "tiktok-videos") {
    // Fetch creators without TikTok videos
    const { data: creators, error } = await supabase
      .from('creator_inventory')
      .select('*')
      .not('usuario_tiktok', 'is', null)
      .is('fecha_consulta_videos', null);

    if (error) {
      console.error('Error fetching creators:', error);
      throw new Error(error.message);
    }

    // Execute TikTok videos fetch
    await batchFetchTikTokVideos(creators as Creator[], options?.onProgress);

    return;
  }

  throw new Error("Task not found or not supported");
};
