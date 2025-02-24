
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FilterState } from "../types";

export const useRatesData = (filters: FilterState) => {
  const { page, itemsPerPage, selectedPlatform, selectedPostType, priceRange } = filters;

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

  // Rates query
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["creator-rates", page, itemsPerPage, selectedPlatform, selectedPostType, priceRange],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("creator_rates")
        .select(`
          id,
          creator_profile:profiles(
            full_name
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

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return { data, count };
    },
    enabled: true,
  });

  return {
    platforms,
    postTypes,
    rates,
    ratesLoading,
  };
};
