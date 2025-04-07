import { supabase } from "@/integrations/supabase/client";
import { InstagramUserResponse } from "@/types/instagram";

/**
 * Calls the 'instagram-details' edge function to get Instagram user data
 * @param username Instagram username to query
 * @returns InstagramUserResponse
 * @throws Error if the call fails or returns invalid data
 */
export const fetchInstagramUser = async (
  username: string
): Promise<InstagramUserResponse> => {
  try {
    const functionPath = `instagram-details?username=${encodeURIComponent(
      username
    )}`;

    const { data, error } =
      await supabase.functions.invoke<InstagramUserResponse>(functionPath, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      ;
    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Invalid response from Instagram function");
    }

    return data;
  } catch (err) {
    console.error("fetchInstagramUser error:", err);
    throw new Error(err.message || "Unexpected error");
  }
};
