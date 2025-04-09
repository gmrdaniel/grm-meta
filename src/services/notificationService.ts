
import { supabase } from "@/integrations/supabase/client";
import { NotificationLog } from "@/types/notification";

// Since the types aren't correctly updated yet, we'll need to use a workaround
// using 'any' to bypass the TypeScript error until the types are regenerated
type SupabaseAny = any;

export const fetchNotificationLogs = async (
  page = 1,
  pageSize = 10
): Promise<{ data: NotificationLog[]; count: number }> => {
  try {
    // Count total records
    const { count, error: countError } = await (supabase as SupabaseAny)
      .from("notification_logs")
      .select("*", { count: "exact", head: false });

    if (countError) throw countError;

    // Fetch paginated records with joins
    const { data, error } = await (supabase as SupabaseAny)
      .from("notification_logs")
      .select(`
        *,
        invitation:invitation_id(full_name, email),
        stage:stage_id(name),
        notification_setting:notification_setting_id(subject, message, type)
      `)
      .order("sent_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    return { data: [], count: 0 };
  }
};

export const fetchNotificationSettings = async (): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as SupabaseAny)
      .from("notification_settings")
      .select(`
        *,
        stage:stage_id(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return [];
  }
};
