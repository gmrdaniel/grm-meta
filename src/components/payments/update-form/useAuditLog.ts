
import { supabase } from "@/integrations/supabase/client";
import type { AuditActionType } from '@/components/audit/types';

export interface AuditLogData {
  recordId: string;
  previousData: any;
  newData: any;
  tableName: string;
  module: string;
  actionType: AuditActionType;
}

export const useAuditLog = () => {
  // Obtenemos el usuario directamente de la sesión actual
  const getUserId = async () => {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      const userId = sessionData?.session?.user?.id;
      console.log('Current user ID from session:', userId);
      return userId;
    } catch (e) {
      console.error('Exception getting user ID:', e);
      return null;
    }
  };

  const createAuditLog = async (data: AuditLogData) => {
    // Obtenemos el userId directamente de la sesión cuando se necesita
    const userId = await getUserId();
    
    if (!userId) {
      console.warn('No user ID available for audit logging, will log action without user ID');
      // Continuar con el log pero sin usuario asociado
    }

    console.log('Creating audit log with user ID:', userId || 'unavailable');
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
      // Usar el RPC de Supabase
      const { data: rpcResult, error } = await supabase.rpc('insert_audit_log', {
        _admin_id: userId || '00000000-0000-0000-0000-000000000000', // Usamos un UUID nulo si no hay usuario
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
        
        // Fallback a direct fetch si falla el cliente de Supabase
        return await fallbackDirectFetch(userId || '00000000-0000-0000-0000-000000000000', data);
      }
      
      console.log('Audit log created successfully via Supabase RPC:', rpcResult);
      return true;
    } catch (supabaseError) {
      console.error('Supabase error creating audit log:', supabaseError);
      
      // Fallback a direct fetch si el cliente de Supabase lanza una excepción
      return await fallbackDirectFetch(userId || '00000000-0000-0000-0000-000000000000', data);
    }
  };

  // Método de respaldo usando direct fetch
  const fallbackDirectFetch = async (userId: string, data: AuditLogData) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://ovyakbwetiwkmpqjdhme.supabase.co'}/rest/v1/rpc/insert_audit_log`;
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eWFrYndldGl3a21wcWpkaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjkzMTksImV4cCI6MjA1NDgwNTMxOX0.2JIEJzWigGcyb46r7iK-H5PIwYK04SzWaKHb7ZZV2bw';
      
      const rpcResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
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

  const logPaymentUpdate = async (
    paymentId: string,
    previousData: any,
    newData: any,
    revertible: boolean = true
  ) => {
    try {
      const userId = await getUserId();
      await supabase.rpc('insert_audit_log', {
        _admin_id: userId,
        _action_type: 'payment' as AuditActionType,
        _module: 'payments',
        _table_name: 'service_payments',
        _record_id: paymentId,
        _previous_data: previousData,
        _new_data: newData,
        _revertible: revertible,
        _ip_address: null,
        _user_agent: null,
      });
    } catch (error) {
      console.error('Error logging payment update:', error);
    }
  };

  return { createAuditLog, logPaymentUpdate };
}
