
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";

// export type NotificationSetting = {
//   id: string;
//   type: string;
//   message: string;
//   channel: "email" | "sms";
// };

// export function useNotificationSettings() {
//   return useQuery({
//     queryKey: ["notification-settings"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("notification_settings")
//         .select("id, type, message, channel")
//         .order("created_at", { ascending: false });
      
//       if (error) throw error;
//       return data as NotificationSetting[];
//     },
//   });
// }