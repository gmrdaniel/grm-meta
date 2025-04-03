import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  project_id: string | null;
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
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id(name),
        project_stages:stage_id(name)
      `, { count: 'exact' });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error(error.message);
    }
    
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

export async function checkExistingTask(
  creatorId?: string | null, 
  creatorInvitationId?: string | null
): Promise<boolean> {
  if (!creatorId && !creatorInvitationId) {
    throw new Error("Either creatorId or creatorInvitationId must be provided");
  }
  
  let query = supabase.from('tasks').select('id');
  
  if (creatorId) {
    query = query.eq('creator_id', creatorId);
  }
  
  if (creatorInvitationId) {
    query = query.eq('creator_invitation_id', creatorInvitationId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking for existing task:', error);
    throw new Error(error.message);
  }
  
  return data && data.length > 0;
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  project_id?: string | null;
  stage_id: string;
  creator_id?: string | null;
  admin_id?: string | null;
  creator_invitation_id?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'review';
}): Promise<Task> {
  if (taskData.creator_id || taskData.creator_invitation_id) {
    const hasExistingTask = await checkExistingTask(
      taskData.creator_id, 
      taskData.creator_invitation_id
    );
    
    if (hasExistingTask) {
      throw new Error("A task already exists for this user");
    }
  }
  
  if (!taskData.stage_id) {
    taskData.stage_id = "00000000-0000-0000-0000-000000000000";
  }
  
  const taskToInsert = {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || 'pending',
    project_id: taskData.project_id || null,
    stage_id: taskData.stage_id,
    creator_id: taskData.creator_id || null,
    admin_id: taskData.admin_id || null,
    creator_invitation_id: taskData.creator_invitation_id || null,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskToInsert)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }
  
  return data as Task;
}

export async function executeTaskSearch(query: string): Promise<any> {
  const { data, error } = await supabase.rpc('execute_task_search', { 
    query_text: query
  });
  
  if (error) {
    console.error('Error executing task search:', error);
    throw new Error(error.message);
  }
  
  return data;
}
