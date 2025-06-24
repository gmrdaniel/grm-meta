import { supabase } from "@/integrations/supabase/client";
import { FacebookPageDetails } from "@/types/facebookPageDetails";

/**
 * Fetch creators with pagination and filtering
 */
export const fetchFacebookPageDetails = async (
  pageUrl: string
): Promise<FacebookPageDetails> => {
  const { data, error } = await supabase.functions.invoke("facebook-page-details", {
    body: {
      pageUrl: pageUrl
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error.message ?? "Unknown error from facebook-page-details");
  }
  
  return data as FacebookPageDetails
};
