
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation, CreateInvitationData } from "@/types/invitation";

/**
 * Generate a unique invitation code
 */
export const generateInvitationCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters I,1,O,0
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Create a new invitation
 */
export const createInvitation = async (invitationData: CreateInvitationData): Promise<CreatorInvitation> => {
  
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('slug') // Replace 'correct_column_name' with the actual column name from the database
    .eq('id', invitationData.project_id)
    .maybeSingle();

  if (projectError || !project) {
    throw new Error('Project not found or error fetching project slug');
  }
  
  // Generate a unique invitation code
  const invitationCode = generateInvitationCode();
  
  // Generate invitation URL path - UPDATED to use meta/welcome format
  const invitationUrl = `/meta/${project.slug}/${invitationCode}`;
  
  // Log the invitation data for debugging
  console.log('Creating invitation with data:', { ...invitationData, invitationCode, invitationUrl });
  
  // Prepare the complete invitation data
  const completeInvitation = {
    ...invitationData,
    invitation_code: invitationCode,
    invitation_url: invitationUrl,
    status: 'pending' as 'pending' | 'accepted' | 'rejected'
  };
  
  const { data, error } = await supabase
    .from('creator_invitations')
    .insert(completeInvitation)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Failed to create invitation: No data returned');
  }
  
  console.log('Invitation created successfully:', data);
  return data as CreatorInvitation;
};
