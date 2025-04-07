
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFacebookPageApiResult {
  createFacebookPage: (pageUrl: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export const useFacebookPageApi = (): UseFacebookPageApiResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createFacebookPage = useCallback(async (pageUrl: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: responseData, error: functionError } = await supabase.functions.invoke('facebook-page-details', {
        body: {
          pageUrl: pageUrl
        },
      });

      if (functionError) {
        setError(functionError);
        console.error('Error in useCreateFacebookPage:', functionError);
        toast.error('Failed to create Facebook Page. Please try again.');
        return;
      }

      toast.success('Facebook Page created successfully!');
    } catch (err: any) {
      setError(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createFacebookPage,
    loading,
    error,
  };
};
