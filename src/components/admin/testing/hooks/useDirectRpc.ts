
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDirectRpc() {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectTest = async () => {
    if (!invitationCode.trim()) {
      setError("Por favor ingrese un código de invitación");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const {
        data,
        error: supabaseError
      } = await supabase.rpc('find_invitation_by_code', {
        code_param: invitationCode
      });
      if (supabaseError) throw supabaseError;
      setResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing direct RPC call:", err);
      setError("Error al consultar RPC: " + (err instanceof Error ? err.message : String(err)));
      setResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    invitationCode,
    setInvitationCode,
    result,
    loading,
    error,
    handleDirectTest
  };
}
