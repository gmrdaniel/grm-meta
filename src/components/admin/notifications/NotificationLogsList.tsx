
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mail, MessageSquare } from "lucide-react";
import { fetchNotificationLogs } from "@/services/notificationService";
import { NotificationLog, NotificationStatus, NotificationChannel } from "@/types/notification";

export function NotificationLogsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notificationLogs", page, pageSize],
    queryFn: () => fetchNotificationLogs(page, pageSize),
  });

  const getStatusBadgeProps = (status: NotificationStatus): BadgeProps["variant"] => {
    switch (status) {
      case "sent":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const logs = data?.data || [];
  const totalLogs = data?.count || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <div className="animate-pulse text-gray-500">Cargando registros de notificaciones...</div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Error al cargar los registros de notificaciones
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium">Registros de Notificaciones</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Mostrar:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creador</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No hay registros de notificaciones disponibles
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: NotificationLog) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(log.sent_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getChannelIcon(log.channel)}
                      <span className="capitalize">{log.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeProps(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {log.invitation?.full_name || "N/A"}
                    <div className="text-xs text-gray-500 truncate">
                      {log.invitation?.email || ""}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {log.stage?.name || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {log.notification_setting?.subject || "Sin asunto"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-red-500">
                    {log.error_message || ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalLogs)} de {totalLogs}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
