
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreatorServices(
  page: number,
  pageSize: number,
  searchTerm: string,
  selectedServiceId: string
) {
  return useQuery({
    queryKey: ["creator-services", page, searchTerm, selectedServiceId],
    queryFn: async () => {
      console.log("Selected service ID:", selectedServiceId);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("creator_services")
        .select(
          `
          id,
          status,
          created_at,
          updated_at,
          services (
            id,
            name,
            type
          ),
          profiles (
            id,
            personal_data (
              first_name,
              last_name
            )
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (selectedServiceId) {
        query = query.eq("service_id", selectedServiceId);
      }

      if (searchTerm) {
        query = query.textSearch(
          "profiles.personal_data.first_name",
          searchTerm,
          {
            type: "websearch",
            config: "english",
          }
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      console.log("Fetched creator services:", data);

      return {
        creatorServices: data,
        total: count || 0,
      };
    },
  });
}
