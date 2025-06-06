// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

//console.log('SUPABASE_URL : ',SUPABASE_URL)
// Custom function to handle the find_invitation_by_code function
export const findInvitationByCode = async (code: string) => {
  const { data, error } = await supabase.rpc('find_invitation_by_code', {
    code_param: code,
  });

  if (error) {
    console.error('Error in findInvitationByCode:', error);
    return { data: null, error };
  }

  return { data, error: null };
};




