import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
}

interface AuditLogFilters {
  action_type?: string;
  table_name?: string;
  user_id?: string;
}

const filterByAction = (filter: AuditLogFilters) => {
  const query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter.action_type) {
    query.eq('action_type', filter.action_type);
  }

  return query;
};

const filterByTable = (query: any, filter: AuditLogFilters) => {
  if (filter.table_name) {
    query.eq('table_name', filter.table_name);
  }
  return query;
};

const filterByUser = (query: any, filter: AuditLogFilters) => {
  if (filter.user_id) {
    query.eq('user_id', filter.user_id);
  }
  return query;
};

export const useAuditLogs = (filters: AuditLogFilters) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        query = filterByAction(filters);
        query = filterByTable(query, filters);
        query = filterByUser(query, filters);

        const { data, error } = await query;

        if (error) {
          setError(error);
          console.error("Error fetching audit logs:", error);
        } else {
          setAuditLogs(data || []);
        }
      } catch (err: any) {
        setError(err);
        console.error("Unexpected error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [filters]);

  return { auditLogs, loading, error };
};
