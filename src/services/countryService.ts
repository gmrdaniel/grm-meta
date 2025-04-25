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
  console.log("Searching countries with term:", searchTerm);
  
  try {
    const { data, error } = await supabase.rpc('search_countries', { 
      search_term: searchTerm 
    });
    
    if (error) {
      console.error("Error searching countries:", error);
      throw new Error(`Failed to search countries: ${error.message}`);
    }
    
    console.log("Countries search result:", data);
    
    if (!data) return [];
    
    const countriesWithPhoneCodes = data.map((country: any) => ({
      id: country.id,
      code: country.phone_code || '',
      name_es: country.name_es,
      name_en: country.name_en,
      phone_code: country.phone_code,
      active: true
    })) as Country[];

    const usaCanada = [
      {
        id: 'usa',
        code: '1',
        name_es: 'Estados Unidos',
        name_en: 'United States',
        phone_code: '1',
        active: true
      },
      {
        id: 'canada',
        code: '1',
        name_es: 'Canadá',
        name_en: 'Canada',
        phone_code: '1',
        active: true
      }
    ];

    const combinedCountries = [
      ...countriesWithPhoneCodes,
      ...usaCanada.filter(
        country => !countriesWithPhoneCodes.some(c => c.id === country.id)
      )
    ];

    return combinedCountries;
  } catch (err) {
    console.error("Exception in searchCountries:", err);
    return [];
  }
};

export const getCountryById = async (countryId: string): Promise<Country | null> => {
  if (!countryId) return null;
  
  try {
    if (countryId === 'usa') {
      return {
        id: 'usa',
        code: '1',
        name_es: 'Estados Unidos',
        name_en: 'United States',
        phone_code: '1',
        active: true
      };
    }

    if (countryId === 'canada') {
      return {
        id: 'canada',
        code: '1',
        name_es: 'Canadá',
        name_en: 'Canada',
        phone_code: '1',
        active: true
      };
    }
    
    const { data, error } = await supabase
      .from('country_phone_codes')
      .select('id, name_es, name_en, phone_code')
      .eq('id', countryId)
      .single();
    
    if (error) {
      console.error("Error fetching country by ID:", error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      code: data.phone_code || '',
      name_es: data.name_es,
      name_en: data.name_en,
      phone_code: data.phone_code,
      active: true
    };
  } catch (err) {
    console.error("Error fetching country by ID:", err);
    return null;
  }
};
