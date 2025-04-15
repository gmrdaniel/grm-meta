
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Invitation = {
  id: string;
  email: string;
  full_name: string;
};

export function useInvitations() {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_invitations")
        .select("id, email, full_name")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
  });
}