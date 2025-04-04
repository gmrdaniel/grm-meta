import { supabase } from "@/integrations/supabase/client";
import { FacebookPageDetails } from "@/types/FacebookPageDetails";

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

  const parsed = JSON.parse(data);

  if (error) {
    throw new Error(error.message);
  }

  if (parsed?.error) {
    throw new Error(data.error.message || "Unknown error from facebook-page-details");
  }
  
  return parsed.data as FacebookPageDetails
};
