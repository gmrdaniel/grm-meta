
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
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: fetchNotificationSettings,
  });

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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
