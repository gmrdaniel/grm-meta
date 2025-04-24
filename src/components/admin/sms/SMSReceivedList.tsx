
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

export function SMSReceivedList() {
  const [pageSize, setPageSize] = useState("10");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['sms_received_logs', pageSize],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('sms_logs')
        .select('*', { count: 'exact' })
        .eq('direction', 'inbound')
        .order('created_at', { ascending: false })
        .range(0, parseInt(pageSize) - 1);

      if (error) throw error;

      return {
        data,
        count
      };
    }
  });

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
            <TableHead>From</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>+{log.country_code} {log.phone_number}</TableCell>
              <TableCell>{log.message}</TableCell>
              <TableCell>
                <Badge className="bg-green-500">
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-gray-500 mt-4">
        Total: {logs?.count || 0} records
      </div>
    </div>
  );
}
