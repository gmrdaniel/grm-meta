
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AuditLogFilters } from "@/components/audit/types";

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const {
        module,
        actionType,
        startDate,
        endDate,
        search,
        page,
        itemsPerPage
      } = filters;

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          admin:profiles!admin_id(
            full_name,
            email
          ),
          reverter:profiles!reverted_by(
            full_name,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (module) {
        query = query.eq('module', module);
      }

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      if (search) {
        query = query.or(`record_id.ilike.%${search}%,module.ilike.%${search}%`);
      }

      const { data: logs, error, count } = await query;

      if (error) throw error;

      return {
        logs,
        totalCount: count || 0
      };
    },
  });
}

