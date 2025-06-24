import { supabase } from "@/integrations/supabase/client";
import { ContentCategory } from "@/types/contentCategory";

export async function getContentCategoriesByProject(
  projectId: string,
): Promise<ContentCategory[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('project_content_categories')
      .select(`
        content_category_id,
        content_categories (
          id,
          key,
          name_en,
          name_es
        )
      `)
      .eq('project_id', projectId);
  
    if (error) {
      console.error('Error fetching allowed countries:', error);
      return [];
    }
  
    return data.flatMap((item: any) => item.content_categories); 
  };
