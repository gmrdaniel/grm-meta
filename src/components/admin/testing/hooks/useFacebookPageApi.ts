
import { useState } from "react";

export function useFacebookPageApi() {
  const [pageUrl, setPageUrl] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!pageUrl.trim()) {
      setError("Por favor ingrese una URL de página de Facebook");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const encodedUrl = encodeURIComponent(pageUrl);
      const url = `https://facebook-scraper3.p.rapidapi.com/page/details?url=${encodedUrl}`;
      
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
        data: data.results,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error testing Facebook Page API:", err);
      setError("Error al consultar la API de Facebook: " + (err instanceof Error ? err.message : String(err)));
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
    pageUrl,
    setPageUrl,
    result,
    loading,
    error,
    handleTest
  };
}
