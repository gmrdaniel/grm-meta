
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  project_id: string;
  stage_id: string;
  creator_id: string | null;
  admin_id: string | null;
  creator_invitation_id: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
  stage_name?: string;
}

interface FetchTasksParams {
  page: number;
  limit: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'review';
}

interface TasksResponse {
  tasks: Task[];
  totalCount: number;
  totalPages: number;
}

export async function fetchTasks({ page, limit, status }: FetchTasksParams): Promise<TasksResponse> {
  try {
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id(name),
        project_stages:stage_id(name)
      `, { count: 'exact' });
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error(error.message);
    }
    
    // Format the data to extract the joined fields
    const formattedTasks = data.map(task => ({
      ...task,
      project_name: task.projects?.name,
      stage_name: task.project_stages?.name,
    }));
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      tasks: formattedTasks as Task[],
      totalCount,
      totalPages
    };
  } catch (error) {
    console.error('Unexpected error in fetchTasks:', error);
    throw error;
  }
}

export async function fetchTaskById(taskId: string): Promise<Task> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id(name),
        project_stages:stage_id(name)
      `)
      .eq('id', taskId)
      .single();
    
    if (error) {
      console.error('Error fetching task by ID:', error);
      throw new Error(error.message);
    }
    
    // Format the data to extract the joined fields
    const formattedTask = {
      ...data,
      project_name: data.projects?.name,
      stage_name: data.project_stages?.name,
    };
    
    return formattedTask as Task;
  } catch (error) {
    console.error('Unexpected error in fetchTaskById:', error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'review'): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task status:', error);
    throw new Error(error.message);
  }
  
  return data as Task;
}
