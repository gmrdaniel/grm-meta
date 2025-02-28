
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogData {
  recordId: string;
  previousData: any;
  newData: any;
  tableName: string;
  module: string;
  actionType: string;
}

export function useAuditLog() {
  const { user } = useAuth();
  const userId = user?.id;

  const createAuditLog = async (data: AuditLogData) => {
    if (!userId) {
      console.warn('No user ID available for audit logging');
      return false;
    }

    console.log('Creating audit log with user ID:', userId);
    console.log('Audit log data:', {
      admin_id: userId,
      action_type: data.actionType,
      module: data.module,
      table_name: data.tableName,
      record_id: data.recordId,
      previous_data: data.previousData,
      new_data: data.newData,
      revertible: true,
      user_agent: navigator.userAgent
    });
    
    try {
      // Try using the supabase client directly
      const { data: rpcResult, error } = await supabase.rpc('insert_audit_log', {
        _admin_id: userId,
        _action_type: data.actionType,
        _module: data.module,
        _table_name: data.tableName,
        _record_id: data.recordId,
        _previous_data: data.previousData,
        _new_data: data.newData,
        _revertible: true,
        _ip_address: null,
        _user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Error creating audit log via Supabase RPC:', error);
        
        // Fallback to direct fetch if Supabase client fails
        return await fallbackDirectFetch(userId, data);
      }
      
      console.log('Audit log created successfully via Supabase RPC:', rpcResult);
      return true;
    } catch (supabaseError) {
      console.error('Supabase error creating audit log:', supabaseError);
      
      // Fallback to direct fetch if Supabase client throws
      return await fallbackDirectFetch(userId, data);
    }
  };

  // Fallback method using direct fetch
  const fallbackDirectFetch = async (userId: string, data: AuditLogData) => {
    try {
      const rpcResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/insert_audit_log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          _admin_id: userId,
          _action_type: data.actionType,
          _module: data.module,
          _table_name: data.tableName,
          _record_id: data.recordId,
          _previous_data: data.previousData,
          _new_data: data.newData,
          _revertible: true,
          _ip_address: null,
          _user_agent: navigator.userAgent
        })
      });
      
      const rpcResult = await rpcResponse.json();
      console.log('Audit log direct fetch result:', rpcResult);
      console.log('Audit log HTTP status:', rpcResponse.status);
      
      if (!rpcResponse.ok) {
        console.error('Failed to create audit log via direct fetch:', rpcResult);
        return false;
      } else {
        console.log('Audit log created successfully via direct fetch');
        return true;
      }
    } catch (fetchError) {
      console.error('Fetch error creating audit log:', fetchError);
      return false;
    }
  };

  return { createAuditLog, userId };
}
