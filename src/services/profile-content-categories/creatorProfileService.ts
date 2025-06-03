
import { supabase } from "@/integrations/supabase/client";

// Create profile function
export const createProfile = async (profileData: any) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      phone_number: profileData.phoneNumber,
      phone_country_code: profileData.phoneCountryCode,
      country_of_residence_id: profileData.countryOfResidenceId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar URL de Pinterest
export const updatePinterestUrl = async (
  profileId: string,
  pinterestUrl: string
) => {
  const { error } = await supabase
    .from("profiles")
    .update({ pinterest_url: pinterestUrl })
    .eq("id", profileId);

  if (error) throw error;
  return { data: null, error: null };
};

// Reemplazar categorías
export const replaceProfileCategories = async (
  profileId: string,
  categoryIds: string[]
) => {
  const { error: deleteError } = await supabase
    .from("creator_profile_categories")
    .delete()
    .eq("creator_profile_id", profileId);

  if (deleteError) throw deleteError;

  const inserts = categoryIds.map((categoryId) => ({
    creator_profile_id: profileId,
    content_category_id: categoryId,
  }));

  const { error } = await supabase.from("creator_profile_categories").insert(inserts);
  
  if (error) throw error;
  return { data: null, error: null };
};
