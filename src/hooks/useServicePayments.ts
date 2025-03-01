
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
    queryKey: ['service-payments', page, showRecurringOnly, selectedService, brandStatus, creatorStatus],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('service_payments')
        .select(`
          id,
          payment_date,
          payment_month,
          payment_period,
          brand_payment_date,
          creator_payment_date,
          total_amount,
          company_earning,
          creator_earning,
          brand_payment_status,
          creator_payment_status,
          is_recurring,
          payment_receipt_url,
          creator_service:creator_services (
            id,
            monthly_fee,
            company_share,
            profile:profiles (
              id,
              full_name,
              personal_data (
                first_name,
                last_name
              )
            ),
            service:services (
              id,
              name,
              type
            )
          )
        `, { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range(from, to);

      if (showRecurringOnly) {
        query = query.eq('is_recurring', true);
      }

      if (selectedService !== 'all') {
        query = query.eq('creator_service.service.id', selectedService);
      }

      if (brandStatus !== 'all') {
        query = query.eq('brand_payment_status', brandStatus);
      }

      if (creatorStatus !== 'all') {
        query = query.eq('creator_payment_status', creatorStatus);
      }

      const { data: payments, error, count } = await query;

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      // Log para depuración
      console.log("Payments data:", payments);
      
      return {
        payments,
        totalCount: count || 0
      };
    },
  });
}
