
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AuditLog } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatorServicesPagination } from "@/components/creator-services/CreatorServicesPagination";

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AuditLogsTable({ 
  logs, 
  isLoading,
  page,
  totalPages,
  onPageChange 
}: AuditLogsTableProps) {
  const handleRevert = async (log: AuditLog) => {
    try {
      const { error } = await supabase.rpc('revert_audit_action', {
        _audit_log_id: log.id,
        _admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast.success("Action reverted successfully");
    } catch (error) {
      console.error('Error reverting action:', error);
      toast.error("Failed to revert action");
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'status_change':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'revert':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Record ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.created_at), "PPpp")}
              </TableCell>
              <TableCell className="capitalize">{log.module}</TableCell>
              <TableCell>
                <Badge className={getActionBadgeColor(log.action_type)}>
                  {log.action_type}
                </Badge>
              </TableCell>
              <TableCell>{log.admin?.full_name || log.admin_id}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="font-mono text-sm">
                      {log.record_id.slice(0, 8)}...
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{log.record_id}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                {log.reverted_at ? (
                  <Badge variant="secondary">
                    Reverted by {log.reverter?.full_name || log.reverted_by}
                  </Badge>
                ) : log.revertible ? (
                  <Badge variant="outline">Revertible</Badge>
                ) : (
                  <Badge variant="secondary">Non-revertible</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {log.revertible && !log.reverted_at && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevert(log)}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Revert
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 border-t">
        <CreatorServicesPagination
          page={page}
          totalPages={totalPages}
          setPage={onPageChange}
        />
      </div>
    </div>
  );
}
