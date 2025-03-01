
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServicePayments(
  page: number, 
  pageSize: number, 
  showRecurringOnly: boolean,
  selectedService: string,
  brandStatus: string,
  creatorStatus: string
) {
  return useQuery({
    queryKey: ['service-payments', page, pageSize, showRecurringOnly, selectedService, brandStatus, creatorStatus],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('service_payments')
        .select(`
          id as payment_id,
          payment_date,
          payment_month,
          payment_period,
          total_amount,
          company_earning,
          creator_earning,
          brand_payment_status,
          creator_payment_status,
          is_recurring,
          creator_service:creator_services!creator_service_id (
            id as creator_service_id,
            profile:profiles!profile_id (
              full_name
            ),
            service:services!service_id (
              name as service_name,
              type as service_type
            )
          )
        `, { count: 'exact' })
        .order('payment_date', { ascending: false });

      // Apply filters
      if (showRecurringOnly) {
        query = query.eq('is_recurring', true);
      }

      if (selectedService !== 'all') {
        // Using foreignTable syntax to filter on the joined table
        query = query.eq('creator_service.service_id', selectedService);
      }

      if (brandStatus !== 'all') {
        query = query.eq('brand_payment_status', brandStatus);
      }

      if (creatorStatus !== 'all') {
        query = query.eq('creator_payment_status', creatorStatus);
      }

      // Apply pagination after filters
      query = query.range(from, to);

      console.log('Service payments query:', query);
      const { data: payments, error, count } = await query;

      if (error) {
        console.error('Error fetching service payments:', error);
        throw error;
      }

      console.log('Fetched payments:', payments);
      return {
        payments,
        totalCount: count || 0
      };
    },
  });
}
