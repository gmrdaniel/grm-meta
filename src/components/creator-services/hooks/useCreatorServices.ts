
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
          profiles!creator_services_profile_id_fkey(full_name, email),
          services!creator_services_service_id_fkey(id, name, type)
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
      
      console.log("Raw data from query:", data);
      
      // Now, we need to get instagram_username separately since there's no direct relation
      // We'll first get all profile_ids
      const profileIds = data.map(item => item.profile_id).filter(Boolean);
      
      // Then fetch the corresponding instagram usernames
      const { data: personalData, error: personalDataError } = await supabase
        .from('personal_data')
        .select('profile_id, instagram_username')
        .in('profile_id', profileIds);
        
      if (personalDataError) {
        console.error("Error fetching personal data:", personalDataError);
      }
      
      // Create a map for quick lookup
      const instagramMap = new Map();
      personalData?.forEach(item => {
        instagramMap.set(item.profile_id, item.instagram_username);
      });
      
      // Transform the data to match the expected format
      const transformedData = data.map(item => {
        // Log each service to debug
        console.log(`Service for item ${item.id}:`, item.services);
        
        return {
          id: item.id,
          profile_id: item.profile_id,
          service_id: item.service_id,
          status: item.status,
          created_at: item.created_at,
          profile_full_name: item.profiles?.full_name || 'N/A',
          personal_email: item.profiles?.email || 'N/A',
          instagram_username: item.profile_id ? instagramMap.get(item.profile_id) || null : null,
          service_name: item.services?.name || 'Sin Nombre',
          service_type: item.services?.type || 'N/A'
        };
      });
      
      console.log("Transformed creator services:", transformedData);
      
      return {
        creatorServices: transformedData,
        total: count || 0,
      };
    },
  });
}
