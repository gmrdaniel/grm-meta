
import { useState } from "react";

export function useYouTubeShortsApi() {
  const [channelId, setChannelId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [loadingVideoDetails, setLoadingVideoDetails] = useState<boolean>(false);
  const [videoDetailsError, setVideoDetailsError] = useState<string | null>(null);
  const [allVideoDetails, setAllVideoDetails] = useState<{[key: string]: any}>({});

  const handleTest = async () => {
    if (!channelId.trim()) {
      setError("Por favor ingrese un ID de canal de YouTube");
      return;
    }
    
    setLoading(true);
    setError(null);
    setAllVideoDetails({});
    
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
      
      const shortsResult = {
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      };
      
      setResult(shortsResult);
      
      // Automatically fetch details for each short
      if (data.contents && data.contents.length > 0) {
        // Fetch details for each video sequentially to avoid rate limiting
        for (const short of data.contents) {
          const videoId = short.video?.videoId;
          if (videoId) {
            await fetchVideoDetailsForAll(videoId);
          }
        }
      }
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

  const fetchVideoDetailsForAll = async (videoId: string) => {
    try {
      const url = `https://youtube-data8.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`;
      
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
      
      setAllVideoDetails(prev => ({
        ...prev,
        [videoId]: {
          data,
          success: true,
          timestamp: new Date().toLocaleString()
        }
      }));
    } catch (err) {
      console.error("Error fetching YouTube Video Details:", err);
      setAllVideoDetails(prev => ({
        ...prev,
        [videoId]: {
          success: false,
          error: err,
          timestamp: new Date().toLocaleString()
        }
      }));
    }
  };

  const fetchVideoDetails = async (videoId: string) => {
    if (!videoId) {
      setVideoDetailsError("ID de video no válido");
      return;
    }
    
    setLoadingVideoDetails(true);
    setVideoDetailsError(null);
    
    try {
      const url = `https://youtube-data8.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`;
      
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
      
      setVideoDetails({
        videoId,
        data,
        success: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error("Error fetching YouTube Video Details:", err);
      setVideoDetailsError("Error al consultar la API de YouTube Video Details: " + (err instanceof Error ? err.message : String(err)));
      setVideoDetails({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoadingVideoDetails(false);
    }
  };

  return {
    channelId,
    setChannelId,
    result,
    loading,
    error,
    handleTest,
    videoDetails,
    loadingVideoDetails,
    videoDetailsError,
    fetchVideoDetails,
    allVideoDetails
  };
}
