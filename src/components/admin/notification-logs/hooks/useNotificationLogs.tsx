
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotificationLogs } from "../services/notificationLogsService";
import { NotificationLog } from "../types";

export function useNotificationLogs() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { 
    data: allLogs, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: fetchNotificationLogs,
  });

  // Calculate pagination
  const totalLogs = allLogs?.length || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const logs = allLogs?.slice(startIndex, startIndex + pageSize);

  // Reset to first page when changing page size
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  return {
    logs,
    allLogs,
    isLoading,
    error,
    refetch,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalLogs,
    totalPages
  };
}
