
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreatorServices(
  page: number,
  pageSize: number,
  searchTerm: string,
  selectedServiceId: string,
  showAll: boolean = false
) {
  return useQuery({
    queryKey: ["creator-services", page, searchTerm, selectedServiceId, showAll],
    queryFn: async () => {
      console.log("Selected service ID:", selectedServiceId);
      console.log("Show all services:", showAll);

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
        .order("created_at", { ascending: false });

      // Por defecto, solo mostrar activos a menos que showAll sea true
      if (!showAll) {
        query = query.eq("status", "active");
        console.log("Filtering only active creator services");
      }

      if (selectedServiceId && selectedServiceId !== "all") {
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

      // Aplicar paginación después de todos los filtros
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching creator services:", error);
        throw error;
      }

      console.log("Fetched creator services:", data);
      console.log("Total count:", count);
      console.log("Status filter applied:", !showAll);

      return {
        creatorServices: data,
        total: count || 0,
      };
    },
  });
}
