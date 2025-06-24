import { supabase } from '@/integrations/supabase/client';
import { ProjectStage } from '@/types/project';

export const fetchProjectStages = async (projectId: string): Promise<ProjectStage[]> => {
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching project stages:', error);
    throw new Error(error.message);
  }
  
  if (!data) return [];
  
  return data as ProjectStage[]
};