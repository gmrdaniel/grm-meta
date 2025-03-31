import { supabase } from "@/integrations/supabase/client";

export const sendEmail = async ({
  email,
  subject,
  html,
  environment = "development",
}: {
  email: string;
  subject: string;
  html: string;
  environment?: "development" | "production";
}): Promise<void> => {
  const { data, error } = await supabase.functions.invoke("send-invitation-email", {
    body: { email, subject, html },
    headers: { "x-environment": environment },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Unknown error from Resend");
  }
};
