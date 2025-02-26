
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { AuditLogsFilters } from "@/components/audit/AuditLogsFilters";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditLogFilters } from "@/components/audit/types";

const ITEMS_PER_PAGE = 10;

export default function AuditLogs() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const { data, isLoading } = useAuditLogs(filters);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
            
            <div className="space-y-6">
              <AuditLogsFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
              
              <AuditLogsTable
                logs={data?.logs || []}
                isLoading={isLoading}
                page={filters.page}
                totalPages={Math.ceil((data?.totalCount || 0) / ITEMS_PER_PAGE)}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
