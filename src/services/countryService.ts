
import { supabase } from "@/integrations/supabase/client";

export type Country = {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  active: boolean;
};

export const getActiveCountries = async (): Promise<Country[]> => {
  const { data, error } = await supabase
    .from('country')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }

  return data || [];
};
