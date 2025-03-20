import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation, CreateInvitationData } from "@/types/invitation";
import { fetchProjectStages } from "./projectService";
import { ProjectStage } from "@/types/project";

/**
 * Fetch all creator invitations
 */
export const fetchInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invitations:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation[];
};

/**
 * Fetch a specific invitation by ID
 */
export const fetchInvitationById = async (id: string): Promise<CreatorInvitation> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching invitation:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation;
};

/**
 * Fetch a specific invitation by invitation code
 * Modified to add more debugging and handle case insensitivity properly
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  if (!code) {
    console.error('Invalid invitation code provided:', code);
    return null;
  }
  
  console.log('Fetching invitation with code:', code);
  
  // First attempt: Try direct query with exact match (most reliable)
  try {
    const { data: exactData, error: exactError } = await supabase
      .from('creator_invitations')
      .select('*')
      .eq('invitation_code', code)
      .maybeSingle();
    
    if (exactError) {
      console.error('Error fetching invitation by exact code:', exactError);
    } else if (exactData) {
      console.log('Found invitation with exact match:', exactData);
      return exactData as CreatorInvitation;
    } else {
      console.log('No exact match found with code:', code);
    }
  } catch (err) {
    console.error('Exception during exact match query:', err);
  }
  
  // Second attempt: Try with ilike for case-insensitive match
  try {
    console.log('Trying case-insensitive match for code:', code);
    const { data: ilikeData, error: ilikeError } = await supabase
      .from('creator_invitations')
      .select('*')
      .ilike('invitation_code', code)
      .maybeSingle();
    
    if (ilikeError) {
      console.error('Error fetching invitation by case-insensitive code:', ilikeError);
    } else if (ilikeData) {
      console.log('Found invitation with case-insensitive match:', ilikeData);
      return ilikeData as CreatorInvitation;
    } else {
      console.log('No case-insensitive match found for code:', code);
    }
  } catch (err) {
    console.error('Exception during case-insensitive query:', err);
  }
  
  // Third attempt: Try raw SQL query as a last resort
  try {
    console.log('Trying raw SQL query as last resort for code:', code);
    const { data: rawData, error: rawError } = await supabase
      .rpc('find_invitation_by_code', { code_param: code });
    
    if (rawError) {
      console.error('Error in raw SQL query for invitation:', rawError);
    } else if (rawData && rawData.length > 0) {
      console.log('Found invitation with raw SQL query:', rawData[0]);
      return rawData[0] as CreatorInvitation;
    } else {
      console.log('No invitation found with raw SQL query for code:', code);
    }
  } catch (err) {
    console.error('Exception during raw SQL query:', err);
  }
  
  console.log('All attempts failed. No invitation found with code:', code);
  return null;
};

/**
 * Generate random string of specified length
 */
const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate invitation code
 * Format: project.name + (invitationType = New User ? NU : EU) + day + month + random string
 */
const generateInvitationCode = async (projectId: string, invitationType: string): Promise<string> => {
  try {
    // Fetch project name
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      console.error('Error fetching project:', projectError);
      throw new Error(projectError.message);
    }
    
    const projectPrefix = projectData.name.substring(0, 3).toUpperCase();
    const typeCode = invitationType === 'new_user' ? 'NU' : 'EU';
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomString = generateRandomString(5);
    
    return `${projectPrefix}-${typeCode}${day}${month}-${randomString}`;
  } catch (error: any) {
    console.error('Error generating invitation code:', error);
    throw new Error(error.message);
  }
};

/**
 * Create a new invitation
 */
export const createInvitation = async (invitationData: CreateInvitationData): Promise<CreatorInvitation> => {
  try {
    // We need to get the first stage of the project to create the invitation URL
    if (!invitationData.project_id) {
      throw new Error('Project ID is required to create an invitation');
    }
    
    const stages = await fetchProjectStages(invitationData.project_id);
    
    if (!stages || stages.length === 0) {
      throw new Error('No stages found for the selected project');
    }
    
    // Get the first stage
    const firstStage = stages.sort((a, b) => a.order_index - b.order_index)[0];
    
    // Generate invitation code
    const invitationCode = await generateInvitationCode(
      invitationData.project_id, 
      invitationData.invitation_type
    );
    
    console.log('Generated invitation code:', invitationCode);
    
    // Generate invitation URL using the stage URL and the invitation code
    // New format: /{stage_url}/{invitation_code}
    const invitationUrl = `/${firstStage.url}/${invitationCode}`;
    
    // Create the invitation with the generated code and URL
    const { data, error } = await supabase
      .from('creator_invitations')
      .insert({
        ...invitationData,
        invitation_url: invitationUrl,
        invitation_code: invitationCode
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating invitation:', error);
      throw new Error(error.message);
    }
    
    // Send invitation email
    await sendInvitationEmail(data.email, data.full_name, data.invitation_url);
    
    return data as CreatorInvitation;
  } catch (error: any) {
    console.error('Error in createInvitation:', error);
    throw new Error(error.message);
  }
};

/**
 * Update invitation status
 */
export const updateInvitationStatus = async (id: string, status: CreatorInvitation['status']): Promise<CreatorInvitation> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating invitation status:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation;
};

/**
 * Delete an invitation
 */
export const deleteInvitation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('creator_invitations')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting invitation:', error);
    throw new Error(error.message);
  }
};

/**
 * Send invitation email
 */
const sendInvitationEmail = async (email: string, name: string, invitationUrl: string): Promise<void> => {
  const fullUrl = `${window.location.origin}${invitationUrl}`;
  
  try {
    const { error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        invitationUrl: fullUrl
      }
    });
    
    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Error invoking send-invitation-email function:', error);
    throw new Error(error.message);
  }
};
