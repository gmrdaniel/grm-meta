
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
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .eq('invitation_code', code)
    .single();
  
  if (error) {
    console.error('Error fetching invitation by code:', error);
    throw new Error(error.message);
  }
  
  return data as CreatorInvitation;
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
