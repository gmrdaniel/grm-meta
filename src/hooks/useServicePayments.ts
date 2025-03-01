
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

      console.log("Filter params:", { 
        page, 
        pageSize, 
        showRecurringOnly, 
        selectedService,
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
        .order('payment_date', { ascending: false })
        .range(from, to);

      // Solo aplicamos el filtro de pagos recurrentes si showRecurringOnly es true
      if (showRecurringOnly) {
        query = query.eq('is_recurring', true);
      }

      // Filtro de servicio - Asegurarnos de que solo se aplique si es diferente de "all"
      if (selectedService && selectedService !== 'all') {
        console.log(`Applying service filter with ID: "${selectedService}"`);
        
        // Este es el punto crítico - tenemos que filtrar por el service_id en la relación
        // La sintaxis correcta es "table_name.column" para filtros de relaciones
        query = query.eq('creator_service.service_id', selectedService);
      }

      if (brandStatus !== 'all') {
        query = query.eq('brand_payment_status', brandStatus);
      }

      if (creatorStatus !== 'all') {
        query = query.eq('creator_payment_status', creatorStatus);
      }

      // Log para mostrar la consulta que se va a ejecutar (lo más cercano posible)
      console.log("Query filters:", {
        recurring: showRecurringOnly ? "true" : "not filtered",
        service: selectedService !== 'all' ? selectedService : "not filtered",
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
      console.log("First few payments:", payments?.slice(0, 2));
      
      // Verificar específicamente el service_id de los resultados
      if (payments && payments.length > 0) {
        const serviceIds = payments.map(p => p.creator_service?.service_id || 'unknown');
        console.log("Service IDs in results:", serviceIds);
      }
      
      return {
        payments,
        totalCount: count || 0
      };
    },
  });
}
