
import React, { useState, useEffect } from "react";
import { getNotificationLogs } from "@/services/notificationService";
import { NotificationLog } from "@/types/notification";
import { toast } from "sonner";
import { AlertTriangle, Check, Clock, Mail, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationLogsTab = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, count } = await getNotificationLogs(currentPage, pageSize);
      setLogs(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      toast.error("Failed to load notification logs");
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="success" className="flex gap-1 items-center">
            <Check size={14} />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex gap-1 items-center">
            <AlertTriangle size={14} />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="flex gap-1 items-center">
            <Clock size={14} />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render channel icon
  const renderChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return (
          <Badge variant="secondary" className="flex gap-1 items-center">
            <Mail size={14} />
            Email
          </Badge>
        );
      case 'sms':
        return (
          <Badge variant="secondary" className="flex gap-1 items-center">
            <MessageSquare size={14} />
            SMS
          </Badge>
        );
      default:
        return <Badge>{channel}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Logs</CardTitle>
        <CardDescription>
          View all notification records from the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="mr-2">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
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
            <span className="ml-2">entries</span>
          </div>
          <div>
            Total: {totalCount} records
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No notification logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.invitation ? (
                        <div>
                          <div className="font-medium">{log.invitation.full_name}</div>
                          <div className="text-sm text-muted-foreground">{log.invitation.email}</div>
                        </div>
                      ) : (
                        "Unknown"
                      )}
                    </TableCell>
                    <TableCell>{renderChannelIcon(log.channel)}</TableCell>
                    <TableCell>{renderStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.notification_setting?.type || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {log.stage?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{formatDate(log.sent_at)}</TableCell>
                    <TableCell>
                      {log.error_message ? (
                        <span className="text-destructive">{log.error_message}</span>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div>
            Showing {logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              Previous
            </Button>
            
            <div className="flex items-center mx-2">
              <span>Page {currentPage} of {totalPages || 1}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              Last
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationLogsTab;
