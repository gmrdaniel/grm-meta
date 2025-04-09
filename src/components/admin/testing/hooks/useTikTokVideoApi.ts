
import { useState } from "react";
import { sleep } from "@/services/tiktokVideoService";

// Counter to track API calls
let apiTestCallCounter = 0;

/**
 * Get RapidAPI key based on call count 
 */
const getTestApiKey = (): string => {
  const apiKeys = [
    '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
    'e41eda6abfmsha84f23487a19afbp1b05bajsn9fec65137765'
  ];
  
  apiTestCallCounter++;
  const keyIndex = (apiTestCallCounter - 1) % apiKeys.length;
  
  console.log(`🔑 Test API Key: Using API KEY #${keyIndex + 1} (${apiKeys[keyIndex].substring(0, 8)}...)`);
  
  return apiKeys[keyIndex];
};

export function useTikTokVideoApi() {
  const [username, setUsername] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentApiKey, setCurrentApiKey] = useState<string>("");

  // Get adaptive delay based on retry count
  const getAdaptiveDelay = (baseDelay: number, retryCount: number): number => {
    // Exponential backoff starting at baseDelay milliseconds
    return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Cap at 10 seconds
  };

  const handleTest = async () => {
    if (!username.trim()) {
      setError("Por favor ingrese un nombre de usuario");
      return;
    }
    
    setLoading(true);
    setError(null);
    setRetryCount(0);
    
    let success = false;
    let responseData;
    let currentRetry = 0;
    
    while (!success && currentRetry < 5) {
      try {
        // Apply a delay on retries
        if (currentRetry > 0) {
          const delayTime = getAdaptiveDelay(1500, currentRetry - 1);
          console.log(`Rate limit hit, retrying in ${delayTime}ms (attempt ${currentRetry + 1}/5)...`);
          await sleep(delayTime);
        }
        
        const apiKey = getTestApiKey();
        setCurrentApiKey(apiKey);
        
        const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(username)}`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
          }
        };
        
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          console.warn('Rate limit exceeded, will retry with longer delay');
          currentRetry++;
          setRetryCount(currentRetry);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        responseData = await response.json();
        success = true;
        
        setResult({
          data: responseData,
          success: true,
          timestamp: new Date().toLocaleString(),
          retries: currentRetry,
          apiKey: `KEY #${(apiTestCallCounter - 1) % 2 + 1} (${apiKey.substring(0, 8)}...)`
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes('429')) {
          currentRetry++;
          setRetryCount(currentRetry);
          if (currentRetry >= 5) {
            setError("Error: Límite de velocidad excedido después de múltiples intentos.");
            setResult({
              success: false,
              error: "Rate limit exceeded after multiple retries",
              timestamp: new Date().toLocaleString()
            });
            break;
          }
        } else {
          console.error("Error testing TikTok Video API:", err);
          setError("Error al consultar la API de TikTok Video: " + (err instanceof Error ? err.message : String(err)));
          setResult({
            success: false,
            error: err,
            timestamp: new Date().toLocaleString()
          });
          break;
        }
      }
    }
    
    setLoading(false);
  };

  return {
    username,
    setUsername,
    result,
    loading,
    error,
    retryCount,
    currentApiKey,
    handleTest
  };
}
