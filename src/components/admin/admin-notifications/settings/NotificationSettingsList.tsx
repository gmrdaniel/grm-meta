
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

// Define NotificationSetting type using the Database type
type NotificationSetting = {
  id: string;
  type: Database["public"]["Enums"]["notification_types"];
  channel: Database["public"]["Enums"]["notification_channel"];
  enabled: boolean;
  delay_days: number;
  frequency_days: number;
  max_notifications: number;
  created_at: string;
  subject: string | null;
  message: string;
  stage_id?: string | null;
};

interface NotificationSettingsListProps {
  onCreateNew: () => void;
}

export function NotificationSettingsList({ onCreateNew }: NotificationSettingsListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["notification-settings", page],
    queryFn: async () => {
      const startIndex = (page - 1) * pageSize;
      
      const { data: settings, error, count } = await supabase
        .from("notification_settings")
        .select("*", { count: "exact" })
        .range(startIndex, startIndex + pageSize - 1)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return {
        settings: settings as NotificationSetting[],
        totalCount: count || 0
      };
    },
  });

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        <p>Error loading notification settings: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <Button onClick={onCreateNew}>Create New Setting</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Delay (days)</TableHead>
              <TableHead>Frequency (days)</TableHead>
              <TableHead>Max Notifications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No notification settings found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              data?.settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>{setting.type}</TableCell>
                  <TableCell>{setting.channel}</TableCell>
                  <TableCell>
                    <Badge variant={setting.enabled ? "default" : "outline"}>
                      {setting.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{setting.message}</TableCell>
                  <TableCell>{setting.delay_days}</TableCell>
                  <TableCell>{setting.frequency_days}</TableCell>
                  <TableCell>{setting.max_notifications}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink 
                  isActive={page === p} 
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
