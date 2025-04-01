
import { useState } from "react";

export function useTikTokVideoApi() {
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
      const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
        }
      };
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      setResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing TikTok Video API:", err);
      setError("Error al consultar la API de TikTok Video: " + (err instanceof Error ? err.message : String(err)));
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
