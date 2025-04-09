
import { supabase } from "@/integrations/supabase/client";
import { NotificationLog } from "@/types/notification";

export const getNotificationLogs = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: NotificationLog[]; count: number }> => {
  try {
    // Get the total count first
    const { count, error: countError } = await supabase
      .from('notification_logs')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting notification logs count:', countError);
      throw countError;
    }

    // Then get the paginated data with relations
    const { data, error } = await supabase
      .from('notification_logs')
      .select(`
        *,
        invitation:invitation_id (
          full_name,
          email
        ),
        stage:stage_id (
          name
        ),
        notification_setting:notification_setting_id (
          subject,
          message,
          type
        )
      `)
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error getting notification logs:', error);
      throw error;
    }

    return {
      data: data as NotificationLog[],
      count: count || 0
    };
  } catch (error) {
    console.error('Failed to fetch notification logs:', error);
    throw error;
  }
};
