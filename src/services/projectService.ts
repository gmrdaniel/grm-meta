import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectStage, SocialMediaPlatform } from "@/types/project";

/**
 * Fetch all projects
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_stages(count),
      project_social_media_platforms(
        social_media_platforms(id, name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }

  const projects = data.map(project => ({
    ...project,
    status: project.status as Project['status'],
    stage_count: project.project_stages[0]?.count || 0,
    platforms: project.project_social_media_platforms?.map(
      (pp: { social_media_platforms: SocialMediaPlatform }) => pp.social_media_platforms
    ) ?? []
  }));

  return projects as Project[];
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
  
  return {
    ...data,
    status: data.status as Project['status']
  };
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
  
  return {
    ...data,
    status: data.status as Project['status']
  };
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
  
  return {
    ...data,
    status: data.status as Project['status']
  };
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
  
  return data.map(stage => ({
    ...stage,
    responsible: stage.responsible as ProjectStage['responsible'],
    privacy: stage.privacy as ProjectStage['privacy']
  }));
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
  
  return {
    ...data,
    responsible: data.responsible as ProjectStage['responsible'],
    privacy: data.privacy as ProjectStage['privacy']
  };
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
  
  return {
    ...data,
    responsible: data.responsible as ProjectStage['responsible'],
    privacy: data.privacy as ProjectStage['privacy']
  };
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
export const updateStagesOrder = async (stages: Array<{ id: string; order_index: number }>): Promise<void> => {
  const { error } = await supabase.rpc('update_stages_order', { 
    stages_data: stages 
  });
  
  if (error) {
    console.error('Error updating stages order:', error);
    throw new Error(error.message);
  }
};
