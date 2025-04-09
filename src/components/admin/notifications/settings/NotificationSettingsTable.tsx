
import React from "react";
import { NotificationSetting } from "@/types/notification";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface NotificationSettingsTableProps {
  settings: (NotificationSetting & { project_stages: { name: string } })[];
  onEdit: (setting: NotificationSetting) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

export const NotificationSettingsTable: React.FC<NotificationSettingsTableProps> = ({
  settings,
  onEdit,
  onDelete,
  onToggleEnabled,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-blue-500 hover:bg-blue-600";
      case "notification":
        return "bg-green-500 hover:bg-green-600";
      case "alert":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "";
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-purple-500 hover:bg-purple-600";
      case "sms":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Delay (days)</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Max Notifications</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Enabled</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.map((setting) => (
          <TableRow key={setting.id}>
            <TableCell>
              <Badge className={getTypeColor(setting.type)}>
                {setting.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getChannelColor(setting.channel)}>
                {setting.channel}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="max-w-xs truncate" title={setting.message}>
                {setting.subject && (
                  <div className="font-medium text-sm">{setting.subject}</div>
                )}
                <div className="text-xs text-muted-foreground">{setting.message}</div>
              </div>
            </TableCell>
            <TableCell>
              {setting.project_stages?.name || "No stage"}
            </TableCell>
            <TableCell>{setting.delay_days}</TableCell>
            <TableCell>{setting.frequency_days}</TableCell>
            <TableCell>{setting.max_notifications}</TableCell>
            <TableCell>
              {format(new Date(setting.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <Switch
                checked={setting.enabled}
                onCheckedChange={(checked) => onToggleEnabled(setting.id, checked)}
              />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(setting)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(setting.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
