
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFacebookPageApi() {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPageDetails = async (pageUrl: string) => {
    if (!pageUrl.trim()) {
      setError("Please enter a valid Facebook page URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the edge function via Supabase client
      const { data, error: functionError } = await supabase.functions.invoke(
        'facebook-page-details',
        {
          body: { pageUrl }
        }
      );

      if (functionError) {
        throw functionError;
      }

      setResult({
        data: data?.data || null,
        success: true,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error invoking Supabase function:", err);
      setError(
        "An error occurred while fetching Facebook page details: " +
          (err instanceof Error ? err.message : String(err))
      );
      setResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString(),
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
    fetchPageDetails,
  };
}
