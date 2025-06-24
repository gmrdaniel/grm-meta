import { supabase } from "@/integrations/supabase/client";
import { EmailTemplate } from "@/types/emailTemplate";

export const fetchEmailTemplate = async (name: string): Promise<String> => {
    const { data, error } = await supabase
        .from('email_templates')
        .select('html')
        .eq('name', name)
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching all invitations:', error);
        throw new Error(error.message);
    }

    const typedData = data as EmailTemplate;

    return typedData.html;
};
