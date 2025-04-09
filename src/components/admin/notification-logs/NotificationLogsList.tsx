
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { format } from "date-fns";

type NotificationLog = {
  id: string;
  channel: "email" | "sms";
  status: "sent" | "failed" | "pending";
  error_message: string | null;
  sent_at: string;
  invitation_id: string;
  notification_setting_id: string;
  stage_id: string | null;
  // Joined data
  invitation_email?: string;
  invitation_full_name?: string;
  setting_type?: string;
  setting_message?: string;
  stage_name?: string;
};

export function NotificationLogsList() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { data: allLogs, isLoading, error, refetch } = useQuery({
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getChannelColor = (channel: string) => {
    return channel === 'email' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  };

  const renderPagination = () => {
    if (totalLogs <= pageSize) return null;

    // Generate page numbers
    let pageNumbers = [];
    const maxDisplayPages = 5;
    
    if (totalPages <= maxDisplayPages) {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first and last page, and a few pages around current
      if (currentPage <= 3) {
        pageNumbers = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pageNumbers = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-medium">Notification Logs</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {logs && logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No notification logs found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getChannelColor(log.channel)}>
                      {log.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.invitation_full_name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{log.invitation_email || 'No email'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.stage_name || 'Unknown Stage'}</TableCell>
                  <TableCell>
                    {log.sent_at ? format(new Date(log.sent_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {log.error_message ? (
                      <div className="max-w-xs truncate text-red-500 hover:text-clip" title={log.error_message}>
                        {log.error_message}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {renderPagination()}
      
      <div className="text-sm text-gray-500 text-right">
        Showing {Math.min(logs?.length || 0, pageSize)} of {totalLogs} logs
      </div>
    </div>
  );
}

async function fetchNotificationLogs() {
  // Join with invitations, notification_settings, and project_stages to get more details
  const { data, error } = await supabase
    .from('notification_logs' as any)
    .select(`
      *,
      creator_invitations:invitation_id (email, full_name),
      notification_settings:notification_setting_id (type, message),
      project_stages:stage_id (name)
    `)
    .order('sent_at', { ascending: false });

  if (error) throw error;

  // Process the joined data to flatten the structure
  return data.map((log: any) => ({
    ...log,
    invitation_email: log.creator_invitations?.email || null,
    invitation_full_name: log.creator_invitations?.full_name || null,
    setting_type: log.notification_settings?.type || null,
    setting_message: log.notification_settings?.message || null,
    stage_name: log.project_stages?.name || null,
  }));
}
