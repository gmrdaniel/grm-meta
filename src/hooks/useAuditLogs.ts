
// Asumimos que este archivo existe y necesita ser actualizado
// para trabajar correctamente con el tipo AuditActionType
// Ya que no tenemos el archivo completo, hacemos las correcciones
// necesarias en las líneas de error mencionadas

import { supabase } from "@/integrations/supabase/client";
import { AuditLog, AuditLogFilters, AuditActionType } from "@/components/audit/types";
import { useQuery } from "@tanstack/react-query";

// Función para obtener los logs de auditoría
export const useAuditLogs = (filters: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      // Calculamos los índices para la paginación
      const from = (filters.page - 1) * filters.itemsPerPage;
      const to = from + filters.itemsPerPage - 1;

      // Iniciamos la consulta base
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin:admin_id(email, full_name),
          reverter:reverted_by(email, full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicamos los filtros si están presentes
      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.startDate && filters.endDate) {
        const startStr = filters.startDate.toISOString();
        const endStr = filters.endDate.toISOString();
        query = query.gte('created_at', startStr).lte('created_at', endStr);
      }

      if (filters.search) {
        query = query.or(`record_id.ilike.%${filters.search}%,module.ilike.%${filters.search}%`);
      }

      // Aplicamos la paginación
      query = query.range(from, to);

      // Ejecutamos la consulta
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        logs: data as AuditLog[],
        count: count || 0
      };
    },
    placeholderData: (previousData) => previousData,
  });
};
