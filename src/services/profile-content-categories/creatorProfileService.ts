import { supabase } from "@/integrations/supabase/client";
import { PostgrestSingleResponse } from "@supabase/supabase-js";


// Actualizar URL de Pinterest
export const updatePinterestUrl = async (
  profileId: string,
  pinterestUrl: string
): Promise<PostgrestSingleResponse<null>> => {
  return await supabase
    .from("profiles")
    .update({ pinterest_url: pinterestUrl })
    .eq("id", profileId);
};

// Reemplazar categorías
export const replaceProfileCategories = async (
  profileId: string,
  categoryIds: string[]
): Promise<PostgrestSingleResponse<null>> => {
  const { error: deleteError } = await supabase
    .from("creator_profile_categories")
    .delete()
    .eq("creator_profile_id", profileId);

  if (deleteError) return { data: null, error: deleteError };

  const inserts = categoryIds.map((categoryId) => ({
    creator_profile_id: profileId,
    content_category_id: categoryId,
  }));

  return await supabase.from("creator_profile_categories").insert(inserts);
};
