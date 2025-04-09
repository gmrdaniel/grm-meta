
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
  try {
    const { error } = await supabase
      .from('notification_settings' as any)
      .update({ enabled: !currentStatus } as any)
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Status updated successfully");
    return true;
  } catch (err: any) {
    toast.error(`Failed to update status: ${err.message}`);
    return false;
  }
};

export const deleteNotificationSetting = async (id: string) => {
  if (!confirm("Are you sure you want to delete this notification setting? This action cannot be undone.")) {
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('notification_settings' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Notification setting deleted");
    return true;
  } catch (err: any) {
    toast.error(`Failed to delete setting: ${err.message}`);
    return false;
  }
};
