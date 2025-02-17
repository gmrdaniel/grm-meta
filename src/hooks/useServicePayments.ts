
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServicePayments(page: number, pageSize: number, showRecurringOnly: boolean) {
  return useQuery({
    queryKey: ['service-payments', page, showRecurringOnly],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('service_payments')
        .select(`
          *,
          creator_service:creator_services (
            profiles (
              personal_data (
                first_name,
                last_name
              )
            ),
            services (
              name
            )
          )
        `, { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range(from, to);

      if (showRecurringOnly) {
        query = query.eq('is_recurring', true);
      }

      const { data: payments, error, count } = await query;

      if (error) throw error;
      return {
        payments,
        totalCount: count || 0
      };
    },
  });
}
