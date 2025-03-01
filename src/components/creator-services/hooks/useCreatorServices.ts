
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

      // Build the query with joins
      let query = supabase
        .from('creator_services')
        .select(`
          id,
          profile_id,
          service_id,
          status,
          created_at,
          profiles!creator_services_profile_id_fkey(full_name),
          profiles!creator_services_profile_id_fkey(email),
          personal_data!personal_data_profile_id_fkey(instagram_username),
          services!creator_services_service_id_fkey(name, type)
        `);

      // Apply filters
      if (selectedServiceId && selectedServiceId !== "all") {
        query = query.eq('service_id', selectedServiceId);
      }
      
      if (!showAll) {
        query = query.eq('status', 'activo');
      }
      
      if (showRecurring) {
        query = query.eq('services.type', 'recurrente');
      }
      
      if (searchTerm) {
        query = query.ilike('profiles.full_name', `%${searchTerm}%`);
      }

      // Get the count of matching rows
      const { count, error: countError } = await supabase
        .from('creator_services')
        .select('id', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error counting creator services:", countError);
        throw countError;
      }

      // Execute the query with pagination and ordering
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching creator services:", error);
        throw error;
      }
      
      // Transform the data to match the expected format
      const transformedData = data.map(item => ({
        id: item.id,
        profile_id: item.profile_id,
        service_id: item.service_id,
        status: item.status,
        created_at: item.created_at,
        profile_full_name: item.profiles?.full_name || 'N/A',
        personal_email: item.profiles?.email || 'N/A',
        instagram_username: item.personal_data?.instagram_username || null,
        service_name: item.services?.name || 'N/A',
        service_type: item.services?.type || 'N/A'
      }));
      
      console.log("Fetched creator services:", transformedData);
      
      return {
        creatorServices: transformedData,
        total: count || 0,
      };
    },
  });
}
