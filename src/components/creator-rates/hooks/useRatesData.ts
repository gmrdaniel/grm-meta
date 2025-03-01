
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FilterState } from "../types";

export const useRatesData = (filters: FilterState) => {
  const { page, itemsPerPage, selectedPlatform, selectedPostType, selectedCountry, priceRange } = filters;

  // Platforms query
  const { data: platforms } = useQuery({
    queryKey: ["social-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("id, name")
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });

  // Post types query
  const { data: postTypes } = useQuery({
    queryKey: ["post-types", selectedPlatform],
    queryFn: async () => {
      const query = supabase
        .from("post_types")
        .select("id, name")
        .eq("status", "active");

      if (selectedPlatform) {
        query.eq("platform_id", selectedPlatform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  // Countries query - fetch unique countries from profiles
  const { data: countries } = useQuery({
    queryKey: ["creator-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personal_data")
        .select("country_of_residence")
        .not("country_of_residence", "is", null)
        .order("country_of_residence");

      if (error) throw error;
      
      // Create a unique list of countries
      const uniqueCountries = Array.from(new Set(data.map(item => item.country_of_residence)))
        .filter(Boolean)
        .map(country => ({
          name: country,
          value: country
        }));
        
      return uniqueCountries;
    },
  });

  // Rates query
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["creator-rates", page, itemsPerPage, selectedPlatform, selectedPostType, selectedCountry, priceRange],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("creator_rates")
        .select(`
          id,
          creator_profile:profiles!creator_rates_profile_id_fkey(
            full_name,
            email,
            personal_data(
              instagram_username,
              country_of_residence
            )
          ),
          post_types(
            name,
            social_platforms(
              name,
              id
            )
          ),
          rate_usd,
          is_active
        `, { count: 'exact' })
        .gte("rate_usd", priceRange[0])
        .lte("rate_usd", priceRange[1])
        .order('created_at', { ascending: false });

      if (selectedPostType && selectedPostType !== 'todos') {
        query = query.eq("post_type_id", selectedPostType);
      }

      if (selectedPlatform && selectedPlatform !== 'todas') {
        query = query.eq("post_types.platform_id", selectedPlatform);
      }

      if (selectedCountry && selectedCountry !== 'todos') {
        query = query.eq("profiles.personal_data.country_of_residence", selectedCountry);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return { data, count };
    },
    enabled: true,
  });

  return {
    platforms,
    postTypes,
    countries,
    rates,
    ratesLoading,
  };
};
