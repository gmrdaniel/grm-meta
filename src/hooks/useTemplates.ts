
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  message: string;
}

export const useTemplates = () => {
  return useQuery<Template[]>({
    queryKey: ['sms_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('id, name, message')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};
