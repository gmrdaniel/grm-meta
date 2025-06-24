import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const sendMagicLink = async (email: string): Promise<boolean> => {
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (signInError) {
    toast.error(`Error sending magic link: ${signInError.message}`);
    console.error(signInError);
    return false;
  }

  return true;
};