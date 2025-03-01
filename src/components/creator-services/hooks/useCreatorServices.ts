
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

      // Using a custom query to fetch creator services
      let query = supabase.rpc('list_creator_services');

      // Apply filters
      let filters = [];
      let values = {};
      
      // Filter by service ID if provided
      if (selectedServiceId && selectedServiceId !== "all") {
        filters.push("service_id = :service_id");
        values.service_id = selectedServiceId;
      }
      
      // Filter by status if showAll is false
      if (!showAll) {
        filters.push("status = :status");
        values.status = 'activo';
      }
      
      // Filter by service type if showRecurring is true
      if (showRecurring) {
        filters.push("service_type = :service_type");
        values.service_type = 'recurrente';
      }
      
      // Add search filter if provided
      if (searchTerm) {
        filters.push("profile_full_name ILIKE :search_term");
        values.search_term = `%${searchTerm}%`;
      }
      
      // Build the final filter query
      if (filters.length > 0) {
        const filterQuery = filters.join(' AND ');
        
        // Execute the count query with filters
        const { count, error: countError } = await supabase
          .from('creator_services')
          .select('id', { count: 'exact', head: true })
          .or(filters.join(','), values);
          
        if (countError) {
          console.error("Error counting creator services:", countError);
          throw countError;
        }
        
        // Execute the main query with filters and pagination
        const { data, error } = await supabase
          .from('creator_services_view')
          .select('*')
          .or(filters.join(','), values)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching creator services:", error);
          throw error;
        }
        
        console.log("Fetched creator services:", data);
        
        return {
          creatorServices: data,
          total: count || 0,
        };
      } else {
        // No filters, just apply pagination
        const { count, error: countError } = await supabase
          .from('creator_services')
          .select('id', { count: 'exact', head: true });
          
        if (countError) {
          console.error("Error counting creator services:", countError);
          throw countError;
        }
        
        const { data, error } = await supabase
          .from('creator_services_view')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching creator services:", error);
          throw error;
        }
        
        console.log("Fetched creator services:", data);
        
        return {
          creatorServices: data,
          total: count || 0,
        };
      }
    },
  });
}
