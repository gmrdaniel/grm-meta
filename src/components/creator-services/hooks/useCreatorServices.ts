
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreatorServices(
  page: number,
  pageSize: number,
  searchTerm: string,
  selectedServiceId: string,
  showAll: boolean = false,
  showRecurring: boolean = true
) {
  return useQuery({
    queryKey: ["creator-services", page, searchTerm, selectedServiceId, showAll, showRecurring],
    queryFn: async () => {
      console.log("Selected service ID:", selectedServiceId);
      console.log("Show all services:", showAll);
      console.log("Show recurring services:", showRecurring);

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
          service_id,
          services!creator_services_service_id_fkey (
            id,
            name,
            type
          ),
          profiles!creator_services_profile_id_fkey (
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
        query = query.eq("status", "activo");
        console.log("Filtering only active creator services");
      }

      // Filtrar por servicios recurrentes si showRecurring es true
      if (showRecurring) {
        query = query.eq("services.type", "recurrente");
        console.log("Filtering only recurring services");
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
      console.log("Recurring filter applied:", showRecurring);

      return {
        creatorServices: data,
        total: count || 0,
      };
    },
  });
}
