
import { useState } from "react";

export function useFacebookReelsApi() {
  const [pageId, setPageId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!pageId.trim()) {
      setError("Por favor ingrese un ID de página de Facebook");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://facebook-scraper3.p.rapidapi.com/page/reels?page_id=${pageId}`;
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
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
      console.error("Error fetching Facebook Reels:", err);
      setError("Error al consultar la API de Facebook Reels: " + (err instanceof Error ? err.message : String(err)));
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
    pageId,
    setPageId,
    result,
    loading,
    error,
    handleTest
  };
}
