import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NotificationLog } from "../types";
import { getStatusColor, getChannelColor } from "../utils/notificationLogUtils";

interface NotificationLogsTableProps {
  logs: NotificationLog[] | undefined;
}

export function NotificationLogsTable({ logs }: NotificationLogsTableProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No notification logs found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Stage Index</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Sent At</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
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
                <span className="font-medium">
                  {log.invitation_full_name || "Unknown"}
                </span>
                <span className="text-xs text-gray-500">
                  {log.invitation_email || "No email"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {log.stage_order_index || "N/A"}
            </TableCell>
            <TableCell>
              {log.stage_name || "Unknown Stage"}
            </TableCell>
            <TableCell>
              {log.sent_at
                ? format(new Date(log.sent_at), "MMM d, yyyy HH:mm")
                : "N/A"}
            </TableCell>
            <TableCell>
              {log.error_message ? (
                <div
                  className="max-w-xs truncate text-red-500 hover:text-clip"
                  title={log.error_message}
                >
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
  );
}
