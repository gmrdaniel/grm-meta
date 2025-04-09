
import { supabase } from "@/integrations/supabase/client";
import { NotificationSetting, NotificationLog } from "@/types/notification";

export const fetchNotificationSettings = async (
  page: number = 1,
  pageSize: number = 10,
  filters: { type?: string; channel?: string } = {}
) => {
  let query = supabase
    .from("notification_settings")
    .select("*, project_stages(name)", { count: "exact" }) as any;

  // Apply filters if provided
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.channel) {
    query = query.eq("channel", filters.channel);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching notification settings:", error);
    throw error;
  }

  return { 
    data: data as (NotificationSetting & { project_stages: { name: string } })[], 
    count: count ?? 0 
  };
};

export const fetchNotificationLogs = async (
  page: number = 1,
  pageSize: number = 10,
  filters: { status?: string; channel?: string } = {}
) => {
  let query = supabase
    .from("notification_logs")
    .select(`
      *,
      notification_settings(*),
      creator_invitations(full_name, email),
      project_stages(name)
    `, { count: "exact" }) as any;

  // Apply filters if provided
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.channel) {
    query = query.eq("channel", filters.channel);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("sent_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching notification logs:", error);
    throw error;
  }

  return { 
    data: data as any[],
    count: count ?? 0 
  };
};

export const createNotificationSetting = async (notificationSetting: Omit<NotificationSetting, 'id' | 'created_at'>) => {
  const { data, error } = await (supabase
    .from("notification_settings")
    .insert(notificationSetting as any)
    .select()
    .single() as any);

  if (error) {
    console.error("Error creating notification setting:", error);
    throw error;
  }

  return data;
};

export const updateNotificationSetting = async (id: string, updates: Partial<NotificationSetting>) => {
  const { data, error } = await (supabase
    .from("notification_settings")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single() as any);

  if (error) {
    console.error("Error updating notification setting:", error);
    throw error;
  }

  return data;
};

export const deleteNotificationSetting = async (id: string) => {
  const { error } = await (supabase
    .from("notification_settings")
    .delete()
    .eq("id", id) as any);

  if (error) {
    console.error("Error deleting notification setting:", error);
    throw error;
  }

  return true;
};
