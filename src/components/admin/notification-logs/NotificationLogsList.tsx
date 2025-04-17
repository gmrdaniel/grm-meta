
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { AlertTriangle } from "lucide-react";
import { useNotificationLogs } from "./hooks/useNotificationLogs";
import { NotificationLogsTable } from "./components/NotificationLogsTable";
import { NotificationLogsPagination } from "./components/NotificationLogsPagination";
import { PageSizeSelector } from "./components/PageSizeSelector";
import { NotificationLogsSummary } from "./components/NotificationLogsSummary";
import { NotificationLogsFilters } from "./components/NotificationLogsFilters";

export function NotificationLogsList() {
  const {
    logs,
    isLoading,
    error,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalLogs,
    totalPages,
    filters,
    setFilters,
    filteredLogs
  } = useNotificationLogs();

  const clearFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: undefined, to: undefined }
    });
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.status ? 1 : 0) + 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <span>Error loading notification logs: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NotificationLogsFilters 
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-medium">Notification Logs</h3>
          <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
        </div>

        <NotificationLogsTable logs={logs} />
      </div>

      <NotificationLogsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      
      <NotificationLogsSummary
        currentCount={logs?.length || 0}
        totalCount={totalLogs}
        filteredCount={filteredLogs?.length || 0}
      />
    </div>
  );
}