
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditLogFilters, AuditActionType } from "./types";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLogsFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

const MODULES = [
  "payments",
  "services",
  "creators",
  "rates",
  "settings"
];

const ACTION_TYPES: AuditActionType[] = [
  "create",
  "update",
  "delete",
  "status_change",
  "payment",
  "revert"
];

export function AuditLogsFilters({ filters, onFiltersChange }: AuditLogsFiltersProps) {
  const handleExport = async () => {
    try {
      const { startDate, endDate, module, actionType } = filters;

      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          admin:profiles!admin_id(
            full_name,
            email
          ),
          reverter:profiles!reverted_by(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (module) {
        query = query.eq('module', module);
      }

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      // Convert to CSV
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Date,Module,Action,Admin,Record ID,Revertible,Reverted\n" +
        logs.map(log => {
          const date = new Date(log.created_at).toLocaleString();
          const admin = log.admin?.full_name || log.admin_id;
          const reverted = log.reverted_at ? `Yes (by ${log.reverter?.full_name})` : 'No';
          return `${date},${log.module},${log.action_type},${admin},${log.record_id},${log.revertible},${reverted}`;
        }).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Audit logs exported successfully");
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error("Error exporting audit logs");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Module</label>
          <Select
            value={filters.module || ""}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, module: value || undefined, page: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All modules</SelectItem>
              {MODULES.map((module) => (
                <SelectItem key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Action Type</label>
          <Select
            value={filters.actionType || ""}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                actionType: value as AuditActionType || undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {ACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <DatePicker
            value={filters.startDate}
            onChange={(date) =>
              onFiltersChange({ ...filters, startDate: date || undefined, page: 1 })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <DatePicker
            value={filters.endDate}
            onChange={(date) =>
              onFiltersChange({ ...filters, endDate: date || undefined, page: 1 })
            }
          />
        </div>
      </div>

      <div className="pt-2">
        <Input
          placeholder="Search by record ID or module..."
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>
    </div>
  );
}
