
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServicePayment } from '@/types/services';

export const useServicePayments = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['servicePayments', page, pageSize],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from('service_payments')
        .select(`
          *,
          creator_service:creator_services(
            *,
            service:services(*),
            profile:profiles(*)
          )
        `, { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range(start, end);
      
      if (error) throw error;
      return { 
        payments: data as ServicePayment[],
        total: count || 0
      };
    },
  });

  return {
    payments: data?.payments || [],
    total: data?.total || 0,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
  };
};

export default useServicePayments;
