
import { useAuth } from "@/hooks/useAuth";

// Accessing the Supabase URL and key from the client.ts constants
const SUPABASE_URL = "https://ovyakbwetiwkmpqjdhme.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eWFrYndldGl3a21wcWpkaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjkzMTksImV4cCI6MjA1NDgwNTMxOX0.2JIEJzWigGcyb46r7iK-H5PIwYK04SzWaKHb7ZZV2bw";

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
      return;
    }

    console.log('Creating audit log with user ID:', userId);
    console.log('Audit log data:', {
      _admin_id: userId,
      _action_type: data.actionType,
      _module: data.module,
      _table_name: data.tableName,
      _record_id: data.recordId,
      _previous_data: data.previousData,
      _new_data: data.newData,
      _revertible: true,
      _user_agent: navigator.userAgent
    });
    
    try {
      const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/insert_audit_log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
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
