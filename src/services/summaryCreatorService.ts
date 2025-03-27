
import { supabase } from "@/integrations/supabase/client";

export interface SummaryCreator {
  nombre: string | null;
  apellido: string | null;
  correo: string | null;
  usuario_tiktok: string | null;
  seguidores_tiktok: number | null;
  engagement: number | null;
  date_last_post: number | null;
  duration_average: number | null;
}

/**
 * Fetch creator summary data with pagination
 */
export const fetchCreatorsSummary = async (
  page: number = 1, 
  pageSize: number = 10
): Promise<{ data: SummaryCreator[], count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('summary_creator')
    .select('*', { count: 'exact' })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching creators summary:', error);
    throw new Error(error.message);
  }
  
  return { 
    data: data as SummaryCreator[], 
    count: count || 0 
  };
};
