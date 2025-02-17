
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .order("name");

      if (error) throw error;

      // Validamos los datos antes de devolverlos
      const validServices = data?.filter(service => service.id && service.name) || [];
      console.log("Available services:", validServices);
      return validServices;
    },
  });
}
