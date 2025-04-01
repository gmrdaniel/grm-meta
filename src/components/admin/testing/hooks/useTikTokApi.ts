
import { useState } from "react";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";

export function useTikTokApi() {
  const [username, setUsername] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!username.trim()) {
      setError("Por favor ingrese un nombre de usuario");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTikTokUserInfo(username);
      setResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing TikTok API:", err);
      setError("Error al consultar la API de TikTok: " + (err instanceof Error ? err.message : String(err)));
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
    username,
    setUsername,
    result,
    loading,
    error,
    handleTest
  };
}
