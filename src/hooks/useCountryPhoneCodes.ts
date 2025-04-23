
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface CountryPhoneCode {
  id: string;
  name_es: string;
  name_en: string;
  phone_code: string;
}

export function useCountryPhoneCodes(searchTerm: string = '') {
  const [countries, setCountries] = useState<CountryPhoneCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_countries', {
          search_term: searchTerm
        });

        if (error) throw error;
        setCountries(data || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [searchTerm]);

  return { countries, loading };
}
