import { supabase } from "@/integrations/supabase/client";

export const fetchProjectNameByInvitationEmail = async (email: string): Promise<string> => {
    // Paso 1: obtener el project_id desde creator_invitations
    if(!email){
        console.error('Email is null');
        throw new Error('Email is null');
    }
    const { data, error } = await supabase
        .from('creator_invitations')
        .select('project_id, projects(id, name)')
        .eq('email', email)
        .limit(1)
        .single();
    console.log(data);
    
    if (!data) {
        console.error('Error fetching invitation / projects:', error);
        throw new Error(error?.message ?? 'No invitation found');
    }

    const { projects } = data
    const { name } = projects

    return name;
};
