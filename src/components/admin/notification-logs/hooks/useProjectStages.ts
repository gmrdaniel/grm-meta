
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProjectStage = {
  id: string;
  name: string;
  project_id: string;
};

export function useProjectStages() {
  return useQuery({
    queryKey: ["project-stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stages")
        .select("id, name, project_id")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as ProjectStage[];
    },
  });
}
