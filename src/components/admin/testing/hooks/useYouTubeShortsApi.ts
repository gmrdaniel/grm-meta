
import { useState } from "react";

export function useYouTubeShortsApi() {
  const [channelId, setChannelId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!channelId.trim()) {
      setError("Por favor ingrese un ID de canal de YouTube");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://youtube-data8.p.rapidapi.com/channel/videos/?id=${channelId}&filter=shorts_latest&hl=en&gl=US`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'youtube-data8.p.rapidapi.com'
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
      console.error("Error fetching YouTube Shorts:", err);
      setError("Error al consultar la API de YouTube Shorts: " + (err instanceof Error ? err.message : String(err)));
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
    channelId,
    setChannelId,
    result,
    loading,
    error,
    handleTest
  };
}
