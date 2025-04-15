
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { fetchNotificationLogs } from "../services/notificationLogsService";
// import { NotificationLog } from "../types";

// export type DateRange = {
//   from: Date | undefined;
//   to: Date | undefined;
// };

// export type FilterState = {
//   status: string | null;
//   dateRange: DateRange;
// };

// export function useNotificationLogs() {
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [filters, setFilters] = useState<FilterState>({
//     status: null,
//     dateRange: { from: undefined, to: undefined }
//   });
  
//   const { 
//     data: allLogs, 
//     isLoading, 
//     error, 
//     refetch 
//   } = useQuery({
//     queryKey: ['notification-logs'],
//     queryFn: fetchNotificationLogs,
//   });

//   // Apply filters to logs
//   const filteredLogs = allLogs?.filter((log) => {
//     // Filter by status
//     if (filters.status && log.status !== filters.status) {
//       return false;
//     }

//     // Filter by date range
//     if (filters.dateRange.from || filters.dateRange.to) {
//       const logDate = new Date(log.sent_at);
      
//       if (filters.dateRange.from && logDate < filters.dateRange.from) {
//         return false;
//       }
      
//       if (filters.dateRange.to) {
//         // Add one day to include the end date fully
//         const endDate = new Date(filters.dateRange.to);
//         endDate.setDate(endDate.getDate() + 1);
        
//         if (logDate > endDate) {
//           return false;
//         }
//       }
//     }

//     return true;
//   });

//   // Calculate pagination
//   const totalLogs = filteredLogs?.length || 0;
//   const totalPages = Math.ceil(totalLogs / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const logs = filteredLogs?.slice(startIndex, startIndex + pageSize);

//   // Reset to first page when changing filters or page size
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [pageSize, filters]);

//   return {
//     logs,
//     allLogs,
//     filteredLogs,
//     isLoading,
//     error,
//     refetch,
//     pageSize,
//     setPageSize,
//     currentPage,
//     setCurrentPage,
//     totalLogs,
//     totalPages,
//     filters,
//     setFilters
//   };
// }