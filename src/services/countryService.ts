
import { supabase } from "@/integrations/supabase/client";

export interface Country {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  phone_code: string;
  active: boolean;
}

export const searchCountries = async (searchTerm: string = ''): Promise<Country[]> => {
  const { data, error } = await supabase.rpc('search_countries', { 
    search_term: searchTerm 
  });
  
  if (error) {
    console.error("Error searching countries:", error);
    throw new Error(`Failed to search countries: ${error.message}`);
  }
  
  return data.map((country: any) => ({
    id: country.id,
    code: country.iso2 || '', // Map if available from DB
    name_es: country.name_es,
    name_en: country.name_en,
    phone_code: country.phone_code,
    active: true // Assuming active from the function filtering
  })) as Country[];
};

export const getCountryById = async (countryId: string): Promise<Country | null> => {
  if (!countryId) return null;
  
  const { data, error } = await supabase.rpc('search_countries', { 
    search_term: '' 
  });
  
  if (error) {
    console.error("Error fetching countries:", error);
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }
  
  const country = data.find((c: any) => c.id === countryId);
  
  if (!country) return null;
  
  return {
    id: country.id,
    code: country.iso2 || '',
    name_es: country.name_es,
    name_en: country.name_en,
    phone_code: country.phone_code,
    active: true
  };
};
