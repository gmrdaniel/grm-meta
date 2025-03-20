
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectStage } from "@/types/project";

/**
 * Fetch all projects
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_stages(count)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }
  
  // Transform the data to include stage_count
  const projects = data.map(project => ({
    ...project,
    stage_count: project.project_stages[0]?.count || 0
  }));
  
  return projects;
};

/**
 * Fetch a project by ID
 */
export const fetchProjectById = async (id: string): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Create a new project
 */
export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Update a project
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Fetch stages for a project
 */
export const fetchProjectStages = async (projectId: string): Promise<ProjectStage[]> => {
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching project stages:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Create a new stage
 */
export const createProjectStage = async (
  stage: Omit<ProjectStage, 'id' | 'created_at' | 'updated_at'>
): Promise<ProjectStage> => {
  const { data, error } = await supabase
    .from('project_stages')
    .insert(stage)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating stage:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Update a stage
 */
export const updateProjectStage = async (
  id: string, 
  updates: Partial<ProjectStage>
): Promise<ProjectStage> => {
  const { data, error } = await supabase
    .from('project_stages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating stage:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Delete a stage
 */
export const deleteProjectStage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('project_stages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting stage:', error);
    throw new Error(error.message);
  }
};

/**
 * Update stages order
 */
export const updateStagesOrder = async (stages: Pick<ProjectStage, 'id' | 'order_index'>[]): Promise<void> => {
  const { error } = await supabase.rpc('update_stages_order', { stages_data: stages });
  
  if (error) {
    console.error('Error updating stages order:', error);
    throw new Error(error.message);
  }
};
