
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { NotificationSetting } from "../types";
import { getTypeColor, getChannelColor } from "../utils/notificationUtils";

interface NotificationSettingsTableProps {
  settings: NotificationSetting[] | undefined;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDeleteSetting: (id: string) => void;
}

export const NotificationSettingsTable = ({
  settings,
  onToggleStatus,
  onDeleteSetting
}: NotificationSettingsTableProps) => {
  return (
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
                onCheckedChange={() => onToggleStatus(setting.id, setting.enabled)} 
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
                  onClick={() => onDeleteSetting(setting.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
