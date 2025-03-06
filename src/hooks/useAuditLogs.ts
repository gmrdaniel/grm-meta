
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuditLog, AuditActionType } from '@/components/audit/types';

interface AuditLogFilters {
  action_type?: AuditActionType;
  table_name?: string;
  module?: string;
  admin_id?: string;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching audit logs with filters:', filters);
        let query = supabase
          .from('audit_logs')
          .select(`
            id,
            admin_id,
            action_type,
            module,
            table_name,
            record_id,
            previous_data,
            new_data,
            revertible,
            reverted_at,
            reverted_by,
            ip_address,
            user_agent,
            created_at,
            admin:profiles!audit_logs_admin_id_fkey(full_name, email),
            reverter:profiles!audit_logs_reverted_by_fkey(full_name, email)
          `)
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (filters.action_type) {
          query = query.eq('action_type', filters.action_type);
        }

        if (filters.table_name) {
          query = query.eq('table_name', filters.table_name);
        }

        if (filters.module) {
          query = query.eq('module', filters.module);
        }

        if (filters.admin_id) {
          query = query.eq('admin_id', filters.admin_id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching audit logs:", fetchError);
          setError(fetchError);
        } else {
          console.log("Audit logs fetched:", data);
          // Transform the data to match the AuditLog interface
          const transformedData: AuditLog[] = data?.map(item => ({
            id: item.id,
            admin_id: item.admin_id,
            action_type: item.action_type as AuditActionType,
            module: item.module,
            table_name: item.table_name,
            record_id: item.record_id,
            previous_data: item.previous_data,
            new_data: item.new_data,
            revertible: item.revertible || false,
            reverted_at: item.reverted_at,
            reverted_by: item.reverted_by,
            ip_address: item.ip_address,
            user_agent: item.user_agent,
            created_at: item.created_at,
            admin: item.admin,
            reverter: item.reverter
          })) || [];
          
          setAuditLogs(transformedData);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching audit logs:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [filters]);

  return { auditLogs, loading, error };
};
