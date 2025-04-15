
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { NotificationSetting } from "../types";

// export const useNotificationSettings = () => {
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [currentPage, setCurrentPage] = useState<number>(1);
  
//   const { data: allSettings, isLoading, error, refetch } = useQuery({
//     queryKey: ['notification-settings'],
//     queryFn: fetchNotificationSettings,
//   });

//   // Calculate pagination
//   const totalSettings = allSettings?.length || 0;
//   const totalPages = Math.ceil(totalSettings / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const settings = allSettings?.slice(startIndex, startIndex + pageSize);

//   return {
//     settings,
//     allSettings,
//     isLoading,
//     error,
//     refetch,
//     pageSize,
//     setPageSize,
//     currentPage,
//     setCurrentPage,
//     totalSettings,
//     totalPages,
//     startIndex
//   };
// };

// async function fetchNotificationSettings() {
//   // Join with project_stages to get stage names
//   const { data, error } = await supabase
//     .from('notification_settings' as any)
//     .select(`
//       *,
//       project_stages:stage_id (name)
//     `)
//     .order('created_at', { ascending: false });

//   if (error) throw error;

//   // Process the joined data to flatten the structure
//   return data.map((setting: any) => ({
//     ...setting,
//     stage_name: setting.project_stages?.name || null,
//   }));
// }