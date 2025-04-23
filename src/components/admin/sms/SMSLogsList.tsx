
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SMSLog {
  id: string;
  phone_number: string;
  country_code: string;
  recipient_name: string | null;
  message: string;
  status: string;
  created_at: string;
  error_message: string | null;
  template_id: string | null;
}

interface Template {
  id: string;
  name: string;
}

export function SMSLogsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [countryCodeFilter, setCountryCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");

  // Fetch templates for filter
  const { data: templates } = useQuery({
    queryKey: ['sms_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Template[];
    }
  });

  // Fetch SMS logs with filters and pagination
  const { data: logs, isLoading } = useQuery({
    queryKey: ['sms_logs', page, pageSize, countryCodeFilter, statusFilter, templateFilter],
    queryFn: async () => {
      let query = supabase
        .from('sms_logs')
        .select('*, sms_templates(name)', { count: 'exact' });

      if (countryCodeFilter) {
        query = query.ilike('country_code', `%${countryCodeFilter}%`);
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      if (templateFilter) {
        query = query.eq('template_id', templateFilter);
      }

      const start = (page - 1) * parseInt(pageSize);
      const end = start + parseInt(pageSize) - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        data: data.map(log => ({
          ...log,
          template_name: log.sms_templates?.name
        })),
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
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Registros por página</label>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Código de país</label>
          <Input
            value={countryCodeFilter}
            onChange={(e) => setCountryCodeFilter(e.target.value)}
            placeholder="Filtrar por código de país"
            className="w-40"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Estado</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Plantilla</label>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {templates?.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Destinatario</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Plantilla</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{log.recipient_name || '-'}</TableCell>
              <TableCell>+{log.country_code} {log.phone_number}</TableCell>
              <TableCell>{log.template_name || '-'}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(log.status)}>
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {log.error_message || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Total: {logs?.count || 0} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={!logs?.data || logs.data.length < parseInt(pageSize)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
