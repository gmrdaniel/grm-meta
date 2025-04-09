
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

type NotificationSetting = {
  id: string;
  type: "reminder" | "notification" | "alert";
  subject: string | null;
  message: string;
  channel: "email" | "sms";
  enabled: boolean;
  delay_days: number;
  frequency_days: number;
  max_notifications: number;
  stage_id: string | null;
  created_at: string;
  stage_name?: string;
};

export function NotificationSettingsList() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { data: allSettings, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: fetchNotificationSettings,
  });

  // Calculate pagination
  const totalSettings = allSettings?.length || 0;
  const totalPages = Math.ceil(totalSettings / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const settings = allSettings?.slice(startIndex, startIndex + pageSize);

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
        <span>Error loading notification settings: {error.message}</span>
      </div>
    );
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_settings' as any)
        .update({ enabled: !currentStatus } as any)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Status updated successfully");
      refetch();
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteSetting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification setting? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notification_settings' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Notification setting deleted");
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete setting: ${err.message}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getChannelColor = (channel: string) => {
    return channel === 'email' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  };

  const renderPagination = () => {
    if (totalSettings <= pageSize) return null;

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
          <h3 className="text-lg font-medium">Notification Settings</h3>
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

        {settings && settings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No notification settings found</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.hash = "#new"}>
              Create your first notification setting
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Project Stage</TableHead>
                <TableHead>Delay (Days)</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Max Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings?.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(setting.type)}>
                      {setting.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getChannelColor(setting.channel)}>
                      {setting.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>{setting.stage_name || 'All Stages'}</TableCell>
                  <TableCell>{setting.delay_days} days</TableCell>
                  <TableCell>
                    {setting.frequency_days === 0 
                      ? "Once" 
                      : `Every ${setting.frequency_days} days`}
                  </TableCell>
                  <TableCell>
                    {setting.max_notifications === 0 
                      ? "No limit" 
                      : setting.max_notifications}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={setting.enabled} 
                      onCheckedChange={() => handleToggleStatus(setting.id, setting.enabled)} 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSetting(setting.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {renderPagination()}
      
      <div className="text-sm text-gray-500 text-right">
        Showing {Math.min(settings?.length || 0, pageSize)} of {totalSettings} settings
      </div>
    </div>
  );
}

async function fetchNotificationSettings() {
  // Join with project_stages to get stage names
  const { data, error } = await supabase
    .from('notification_settings' as any)
    .select(`
      *,
      project_stages:stage_id (name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Process the joined data to flatten the structure
  return data.map((setting: any) => ({
    ...setting,
    stage_name: setting.project_stages?.name || null,
  }));
}
