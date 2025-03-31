
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
 * Fetch creator summary data with pagination and filtering
 */
export const fetchCreatorsSummary = async (
  page: number = 1, 
  pageSize: number = 10,
  filterEligible: boolean = false
): Promise<{ data: SummaryCreator[], count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from('summary_creator')
    .select('*', { count: 'exact' });
  
  // Apply eligibility filter if requested
  if (filterEligible) {
    query = query
      .gt('seguidores_tiktok', 100000)
      .gt('engagement', 4);
  }
  
  const { data, error, count } = await query
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
