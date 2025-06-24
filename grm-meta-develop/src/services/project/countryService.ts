import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Esquema de validación Zod
const CountrySchema = z.object({
  id: z.string(),
  name_es: z.string(),
  name_en: z.string(),
  phone_code: z.string(),
});

export interface Country {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  phone_code: string;
  active: boolean;
}



export const fetchCountries = async (projectId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('project_allowed_countries')
      .select(`
        country_id,
        countries (
          id,
          name_es,
          iso2,
          phone_code
        )
      `)
      .eq('project_id', projectId);
  
    if (error) {
      console.error('Error fetching allowed countries:', error);
      return [];
    }
  
    return data; 
  };

export const searchCountries = async (searchTerm: string = ''): Promise<Country[]> => {
  console.log("Searching countries with term:", searchTerm);

  try {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('search_countries', {
      search_term: searchTerm
    });

    if (error) {
      console.error("Error searching countries:", error);
      throw new Error(`Failed to search countries: ${error.message}`);
    }

    console.log("Countries search result:", data);

    if (!Array.isArray(data)) return [];

    // Validar cada país
    const validCountries = data.map((item: unknown) => {
      const parsed = CountrySchema.safeParse(item);
      if (!parsed.success) {
        console.warn("Invalid country item:", parsed.error);
        return null;
      }
      const country = parsed.data;
      return {
        id: country.id,
        code: country.phone_code,
        name_es: country.name_es,
        name_en: country.name_en,
        phone_code: country.phone_code,
        active: true
      };
    }).filter(Boolean) as Country[];

    return validCountries;
  } catch (err) {
    console.error("Exception in searchCountries:", err);
    return [];
  }
};

export const getCountryById = async (countryId: string): Promise<Country | null> => {
  if (!countryId) return null;

  try {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('countries')
      .select('id, name_es, name_en, phone_code')
      .eq('id', countryId)
      .single();

    if (error) {
      console.error("Error fetching country by ID:", error);
      return null;
    }

    const parsed = CountrySchema.safeParse(data);
    if (!parsed.success) {
      console.warn("Invalid country data:", parsed.error);
      return null;
    }

    const country = parsed.data;
    return {
      id: country.id,
      code: country.phone_code,
      name_es: country.name_es,
      name_en: country.name_en,
      phone_code: country.phone_code,
      active: true
    };
  } catch (err) {
    console.error("Error fetching country by ID:", err);
    return null;
  }
};

export const getCountriesByProjectId = async (projectId: string): Promise<Country[]> => {
  if (!projectId) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('project_allowed_countries')
      .select('country_id, countries (id, name_es, name_en, phone_code)')
      .eq('project_id', projectId);

    if (error) {
      console.error("Error fetching countries by project ID:", error);
      return [];
    }

    if (!Array.isArray(data)) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validCountries = data.map((item: any) => {
      const country = item.countries;
      const parsed = CountrySchema.safeParse(country);
      if (!parsed.success) {
        console.warn("Invalid country data:", parsed.error);
        return null;
      }

      const c = parsed.data;
      return {
        id: c.id,
        code: c.phone_code,
        name_es: c.name_es,
        name_en: c.name_en,
        phone_code: c.phone_code,
        active: true
      };
    }).filter(Boolean) as Country[];

    return validCountries;
  } catch (err) {
    console.error("Exception in getCountriesByProjectId:", err);
    return [];
  }
};
