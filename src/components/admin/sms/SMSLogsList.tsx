
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SMSLog {
  id: string;
  recipient_name: string | null;
  phone_number: string;
  country_code: string;
  template_name: string | null;
  template_id: string | null;
  status: string;
  sent_at: string;
}

export function SMSLogsList() {
  const [pageSize, setPageSize] = useState("10");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['sms_logs', pageSize],
    queryFn: async () => {
      let query = supabase
        .from('sms_logs')
        .select('*, sms_templates(name)', { count: 'exact' });

      const { data, error, count } = await query
        .order('sent_at', { ascending: false })
        .range(0, parseInt(pageSize) - 1);

      if (error) throw error;

      // Transform raw data to simplified SMSLog format
      const processedData: SMSLog[] = (data as any[]).map(log => ({
        id: log.id,
        recipient_name: log.recipient_name,
        phone_number: log.phone_number,
        country_code: log.country_code,
        template_name: log.sms_templates?.name || null,
        template_id: log.template_id,
        status: log.status,
        sent_at: new Date(log.sent_at).toLocaleString()
      }));

      return {
        data: processedData,
        count
      };
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Select value={pageSize} onValueChange={setPageSize}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Plantilla</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de envío</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.recipient_name || '-'}</TableCell>
              <TableCell>+{log.country_code} {log.phone_number}</TableCell>
              <TableCell>{log.template_name || '-'}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(log.status)}>
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>{log.sent_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-gray-500 mt-4">
        Total: {logs?.count || 0} registros
      </div>
    </div>
  );
}
