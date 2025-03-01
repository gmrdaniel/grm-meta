import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServicePayments(
  page: number, 
  pageSize: number, 
  brandStatus: string,
  creatorStatus: string
) {
  return useQuery({
    queryKey: ['service-payments', page, brandStatus, creatorStatus],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      console.log("Filter params:", { 
        page, 
        pageSize, 
        brandStatus,
        creatorStatus,
        from,
        to
      });

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
          creator_service_id,
          creator_service:creator_services (
            id,
            monthly_fee,
            company_share,
            service_id,
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
        .order('payment_date', { ascending: false });

      if (brandStatus !== 'all') {
        query = query.eq('brand_payment_status', brandStatus);
      }

      if (creatorStatus !== 'all') {
        query = query.eq('creator_payment_status', creatorStatus);
      }

      // Finalmente aplicamos el rango para la paginación
      query = query.range(from, to);

      // Log para mostrar la consulta que se va a ejecutar (lo más cercano posible)
      console.log("Query filters:", {
        brandStatus: brandStatus !== 'all' ? brandStatus : "not filtered",
        creatorStatus: creatorStatus !== 'all' ? creatorStatus : "not filtered",
      });

      const { data: payments, error, count } = await query;

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      // Log para depuración
      console.log("Payments data count:", payments?.length || 0);
      console.log("Total count from API:", count);
      
      if (payments && payments.length > 0) {
        // Log para verificar el contenido del primer pago
        console.log("First payment:", payments[0]);
      } else {
        console.log("No payments found with the current filters");
      }
      
      return {
        payments: payments || [],
        totalCount: count || 0
      };
    },
    // Reemplazamos keepPreviousData por placeholderData que es la opción
    // compatible con la versión actual de TanStack Query
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
